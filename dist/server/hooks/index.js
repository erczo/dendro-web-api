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
// TODO: Add option to ValidationContext for servicePath?

const Ajv = require('ajv');
const url = require('url');
const { errors } = require('feathers-errors');
const { getByDot, setByDot } = require('feathers-hooks-common');
const { treeMap } = require('../lib/utils');
const { ObjectID } = require('mongodb'

// Regular expressions for data type detection
);const BOOL_REGEX = /^(false|true)$/i;
const ID_PATH_REGEX = /\/\w*_id(s)?(\/.*)?$/;
const ID_STRING_REGEX = /^[0-9a-f]{24}$/i;
const ISO_DATE_REGEX = /^([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.([0-9]{3}))?Z$/i;

let validationContext; // Singleton

class ValidationContext {
  constructor(app) {
    this.app = app;
    this.validators = {};
    this.ajv = new Ajv({
      loadSchema: this.loadSchema.bind(null, app)
    });

    // TODO: Deprecate this!
    this.ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
  }

  /**
   * Asynchronous function that will be used to load remote schemas when the
   * method compileAsync is used and some reference is missing.
   */
  loadSchema(app, uri) {
    const parsed = url.parse(uri);
    return app.service('/system/schemas').get(parsed.pathname);
  }

  getValidator(schemaName) {
    const self = this;
    const validate = self.validators[schemaName];

    if (validate) return Promise.resolve(validate);

    return self.app.service('/system/schemas').get(schemaName).then(schema => {
      return self.ajv.compileAsync(schema);
    }).then(validate => {
      self.validators[schemaName] = validate; // Cache in memory
      return validate;
    });
  }
}

function coercer(obj, path) {
  if (typeof obj !== 'string') return obj;

  // Date
  if (ISO_DATE_REGEX.test(obj)) {
    const ms = Date.parse(obj);
    if (!isNaN(ms)) return new Date(ms);
  }

  // ObjectID (strict)
  if (ID_PATH_REGEX.test(path) && ID_STRING_REGEX.test(obj)) return new ObjectID(obj.toString());

  return obj;
}

function queryCoercer(obj, path) {
  if (typeof obj !== 'string') return obj;

  // Boolean
  if (BOOL_REGEX.test(obj)) return obj === 'true';

  // Numeric
  const n = parseFloat(obj);
  if (!isNaN(n) && isFinite(obj)) return n;

  return coercer(obj, path);
}

exports.coerce = () => {
  return hook => {
    if (typeof hook.data === 'undefined') return;
    hook.data = treeMap(hook.data, coercer);
  };
};

exports.coerceQuery = () => {
  return hook => {
    if (typeof hook.params.query !== 'object') return;
    hook.params.query = treeMap(hook.params.query, queryCoercer);
  };
};

exports.splitList = (path, sep = ',', unique = true) => {
  return hook => {
    const value = getByDot(hook, path);
    if (typeof value !== 'string') return;

    const ary = value.split(sep);
    setByDot(hook, path, unique ? [...new Set(ary)] : ary);
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

exports.uniqueArray = path => {
  return hook => {
    const ary = getByDot(hook, path);
    if (Array.isArray(ary)) setByDot(hook, path, [...new Set(ary)]);
  };
};

exports.validate = schemaName => {
  return hook => {
    if (!hook.params.provider && hook.params.noValidate) return; // Skip?

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