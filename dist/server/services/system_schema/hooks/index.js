'use strict';

const commonHooks = require('feathers-hooks-common'
// const globalHooks = require('../../../hooks')
);const { errors } = require('feathers-errors');

exports.before = {
  // all: [],
  // find: [],

  get: [hook => {
    // TODO: Move this to _get in service?
    if (hook.app.get('schemaNames').indexOf(hook.id) === -1) {
      throw new errors.NotFound('Page not found');
    }
  }],

  create: commonHooks.disallow(),
  update: commonHooks.disallow(),
  patch: commonHooks.disallow(),
  remove: commonHooks.disallow()
};

exports.after = {
  // all: [],
  // find: [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
};