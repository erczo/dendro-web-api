'use strict';

const globalHooks = require('../../../hooks');
// const hooks = require('feathers-hooks')

const SCHEMA_NAME = 'person.json';

exports.before = {
  // all: [],

  find: [globalHooks.coerceQuery()],

  // get: [],

  create: [globalHooks.validate(SCHEMA_NAME), globalHooks.timestamp(), globalHooks.coerce()],

  update: [globalHooks.validate(SCHEMA_NAME), globalHooks.timestamp(), globalHooks.coerce(), hook => {
    // TODO: Optimize with find/$select to return fewer fields?
    return hook.app.service('/persons').get(hook.id).then(doc => {
      hook.data.created_at = doc.created_at;
      return hook;
    });
  }],

  // TODO: Validate with Mongo document validation
  patch: [globalHooks.timestamp(), globalHooks.coerce()]

  // remove: []
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