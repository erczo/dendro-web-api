'use strict';

// const globalHooks = require('../../../hooks')
const hooks = require('feathers-hooks');
const { errors } = require('feathers-errors');

// TODO: Allow POST request for longer query params?

exports.before = {
  // all: [],

  find: [hook => {
    const query = hook.params.query;
    if (!query.datastream_id) return;

    // The datastream lookup hook handles splitting and coercion
    return hook.app.service('/datastreams/lookup').find({
      query: { _id: query.datastream_id }
    }).then(datastreams => {
      hook.params.datastreams = datastreams;
      return hook;
    });
  }, hook => {
    const datastreams = hook.params.datastreams;
    if (!Array.isArray(datastreams)) throw new errors.BadRequest('Expected datastreams');
  }, hooks.removeQuery('datastream_id')]

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