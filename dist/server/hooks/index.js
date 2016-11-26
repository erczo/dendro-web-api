'use strict';

// Add any common hooks you want to share across services in here.
//
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.
//
// exports.myHook = (options) => {
//   return (hook) => {
//     console.log('My custom global hook ran. Feathers is awesome!')
//   }
// }

// TODO: Query hooks should allow multiple fields to be specified?
// TODO: splitQuery (default) max items should be in configuration?
// TODO: Add option to ValidationContext for servicePath?

const Ajv = require('ajv');
const { errors } = require('feathers-errors');
const { treeMap } = require('../lib/utils');
const { ObjectID } = require('mongodb');

// Regular expressions for data type detection
const idPathRegex = /^\/\w*_id(\/.*)?$/;
const isoDateRegex = /^([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9]).([0-9]{3})Z$/i;

let validationContext; // Singleton

class ValidationContext {
  constructor(app) {
    this.app = app;
    this.validators = {};
    this.ajv = new Ajv({
      // TODO: Remove - deprecated
      // coerceTypes: true,
      loadSchema: this.loadSchema.bind(null, app)
    });

    // TODO: Remove - deprecated
    // this.ajv.addKeyword('date', {
    //   errors: false,
    //   validate: (schema, data, parentSchema, dataPath, parentData, parentDataProperty) => {
    //     if (!schema) return true

    //     const ms = Date.parse(data)
    //     if (!isNaN(ms)) {
    //       parentData[parentDataProperty] = new Date(ms) // Coerce
    //       return true
    //     }
    //     return false
    //   }
    // })

    // TODO: Remove - deprecated
    // this.ajv.addKeyword('objectID', {
    //   errors: false,
    //   validate: (schema, data, parentSchema, dataPath, parentData, parentDataProperty) => {
    //     if (!schema) return true

    //     if (ObjectID.isValid(data)) {
    //       parentData[parentDataProperty] = new ObjectID(data.toString()) // Coerce
    //       return true
    //     }
    //     return false
    //   }
    // })
  }

  /**
   * Asynchronous function that will be used to load remote schemas when the
   * method compileAsync is used and some reference is missing
   */
  loadSchema(app, uri, callback) {
    // TODO: Needs testing!!!
    app.service('/system/schemas').get(uri, callback);
  }

  getValidator(schemaName) {
    const self = this;
    const validate = self.validators[schemaName];

    if (validate) return Promise.resolve(validate);

    return self.app.service('/system/schemas').get(schemaName).then(schema => {
      return new Promise((resolve, reject) => {
        self.ajv.compileAsync(schema, function (err, validate) {
          if (err) {
            reject(err);
          } else {
            self.validators[schemaName] = validate; // Cache in memory
            resolve(validate);
          }
        });
      });
    });
  }
}

function coercer(obj, path) {
  if (typeof obj !== 'string') return obj;

  if (idPathRegex.test(path) && ObjectID.isValid(obj)) return new ObjectID(obj.toString());
  if (isoDateRegex.test(obj)) {
    const ms = Date.parse(obj);
    if (!isNaN(ms)) return new Date(ms);
  }
  return obj;
}

exports.coerce = () => {
  return hook => {
    if (typeof hook.data === 'undefined') return;
    hook.data = treeMap(hook.data, coercer);
  };
};

exports.coerceQuery = () => {
  return hook => {
    if (typeof hook.params.query === 'undefined') return;
    hook.params.query = treeMap(hook.params.query, coercer);
  };
};

// TODO: Remove - deprecated
// exports.objectIdQuery = (field) => {
//   return (hook) => {
//     const value = hook.params.query[field]
//     if (typeof value === 'undefined') return

//     hook.params.query[field] = treeMap(value, (obj) => {
//       if (ObjectID.isValid(obj)) return new ObjectID(obj.toString())
//       return obj
//     })
//   }
// }

exports.parseBoolQuery = field => {
  return hook => {
    hook.params.query[field] = /^(true|1)$/i.test(hook.params.query[field]);
  };
};

exports.parseIntQuery = (field, defaultValue = 0) => {
  return hook => {
    hook.params.query[field] = parseInt(hook.params.query[field], 10) || defaultValue;
  };
};

exports.splitQuery = (field, sep, op, max = 100) => {
  return hook => {
    const value = hook.params.query[field];
    if (typeof value !== 'string') return;

    const items = value.split(',');
    if (items.length > max) items.length = max; // Truncate
    if (items.length < 2) {} else if (typeof op === 'string') hook.params.query[field] = { [op]: items };else hook.params.query[field] = items;
  };
};

exports.timestamp = () => {
  return hook => {
    delete hook.data.created_at;
    delete hook.data.updated_at;

    switch (hook.method) {
      case 'create':
        hook.data.created_at = new Date();
        hook.data.updated_at = hook.data.created_at;
        break;
      case 'update':
      case 'patch':
        hook.data.updated_at = new Date();
        break;
    }
  };
};

exports.validate = schemaName => {
  return hook => {
    if (!hook.params.provider) return; // Skip for internal calls

    // Lazy init to ensure the async loader gets an app reference
    if (!validationContext) validationContext = new ValidationContext(hook.app);

    return validationContext.getValidator(schemaName).then(validate => {
      if (validate(hook.data)) return hook;
      throw new errors.BadRequest('Validation failed', {
        errors: validate.errors
      });
    });
  };
};