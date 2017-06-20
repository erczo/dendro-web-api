'use strict';

const commonHooks = require('feathers-hooks-common');
const globalHooks = require('../../../hooks');

const SCHEMA_NAME = 'vocabulary.json';

exports.before = {
  // all: [],

  find: globalHooks.coerceQuery(),

  // get: [],

  create: [globalHooks.validate(SCHEMA_NAME), globalHooks.timestamp(), globalHooks.coerce()],

  update: [globalHooks.validate(SCHEMA_NAME), globalHooks.timestamp(), globalHooks.coerce(), hook => {
    // TODO: Optimize with find/$select to return fewer fields?
    return hook.app.service('/vocabularies').get(hook.id).then(doc => {
      hook.data.created_at = doc.created_at;
      return hook;
    });
  }],

  patch: commonHooks.disallow('rest'

  // remove: []
  ) };

exports.after = {
  // all: [],
  // find: [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
};