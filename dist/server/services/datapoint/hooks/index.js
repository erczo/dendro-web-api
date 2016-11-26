'use strict';

const globalHooks = require('../../../hooks');
// const hooks = require('feathers-hooks')
const { errors } = require('feathers-errors');

exports.before = {
  // all: [],

  find: [globalHooks.coerceQuery(), hook => {
    const query = hook.params.query;
    if (query.datastream_id) {
      return hook.app.service('/datastreams').get(query.datastream_id).then(datastream => {
        hook.params.datastream = datastream;
        return hook;
      });
    }
  }, hook => {
    const datastream = hook.params.datastream;
    if (!(typeof datastream === 'object')) throw new errors.BadRequest('Expected datastream');
    if (!Array.isArray(datastream.datapoints_config)) throw new errors.GeneralError('Missing datapoints config');
  }]

  // get: [],
  // create: [],
  // update: [],
  // patch: [],
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