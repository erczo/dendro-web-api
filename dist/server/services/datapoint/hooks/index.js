'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const { errors } = require('feathers-errors');

exports.before = {
  // all: [],

  find: [globalHooks.coerceQuery(), hook => {
    const query = hook.params.query;
    if (!query.datastream_id) return;

    return hook.app.service('/datastreams').get(query.datastream_id).then(datastream => {
      hook.params.datastream = datastream;
      return hook;
    });
  }, hook => {
    const datastream = hook.params.datastream;
    if (!datastream) throw new errors.BadRequest('Expected datastream');
    if (!datastream.datapoints_config) throw new errors.GeneralError('Missing datapoints config');

    /*
      Efficiently merge config instances in a linear traversal.
       Assumptions:
      * Each config instance has a date interval [begins_at, ends_before)
      * The values begins_at and ends_before are Date objects
      * The values begins_at and ends_before are NOT null
     */

    // TODO: Make the following async-ish?

    const stack = [];

    datastream.datapoints_config.sort((a, b) => {
      if (a.begins_at < b.begins_at) return -1;
      if (a.begins_at > b.begins_at) return 1;
      return 0;
    }).forEach(cur => {
      if (cur.ends_before <= cur.begins_at) {
        // Exclude: inverted interval
      } else if (stack.length === 0) {
        stack.push(cur); // Init stack
      } else {
        const top = stack[stack.length - 1];

        if (cur.begins_at >= top.ends_before) {
          stack.push(cur);
        } else if (cur.ends_before <= top.ends_before) {
          // Exclude: cur interval is within top interval
        } else if (cur.begins_at === top.begins_at) {
          stack.pop();
          stack.push(cur);
        } else {
          top.ends_before = cur.begins_at;
          stack.push(cur);
        }
      }
    });

    datastream.datapoints_config = stack;

    // Points must be sorted by time (default DESC)
    const query = hook.params.query;
    query.$sort = {
      time: typeof query.$sort === 'object' && typeof query.$sort.time !== 'undefined' ? query.$sort.time : -1
    };
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