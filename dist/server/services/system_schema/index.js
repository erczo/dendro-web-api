'use strict';

const hooks = require('./hooks');
const fs = require('fs');
const path = require('path');

class Service {
  constructor() {
    // HACK: Syntax highlighting breaks on class methods named 'get'
    this.get = this._get;
  }

  setup(app) {
    this.app = app;
  }

  find(params, callback) {
    const schemaNames = this.app.get('schemaNames');
    callback(null, {
      total: schemaNames.length,
      data: schemaNames
    });
  }

  _get(id) {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../../../../schema', id), 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          // Async-ish JSON parsing
          setImmediate(() => {
            try {
              resolve(JSON.parse(data));
            } catch (parseErr) {
              reject(parseErr);
            }
          });
        }
      });
    });
  }
}

module.exports = function () {
  return function () {
    const app = this;

    app.use('/system/schemas', new Service()

    // Get the wrapped service object, bind hooks
    );const schemaService = app.service('/system/schemas');

    schemaService.before(hooks.before);
    schemaService.after(hooks.after);
  };
}();