'use strict';

// const globalHooks = require('../../../hooks')
// const hooks = require('feathers-hooks')
const { errors } = require('feathers-errors');

// TODO: Allow POST request for longer query params?

exports.before = {
  // all: [],

  find: [hook => {
    const datastreams = hook.params.datastreams;
    if (!Array.isArray(datastreams)) {
      const query = hook.params.query;
      return hook.app.service('/datastreams/lookup').find({ query: query }).then(datastreams => {
        hook.params.datastreams = datastreams;
        return hook;
      });
    }
  }, hook => {
    const datastreams = hook.params.datastreams;
    if (!Array.isArray(datastreams)) throw new errors.BadRequest('Expected datastreams');
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