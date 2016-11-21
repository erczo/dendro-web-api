const globalHooks = require('../../../hooks')
// const hooks = require('feathers-hooks')

// TODO: Allow POST request for longer query params?

exports.before = {
  // all: [],

  find: [
    globalHooks.splitQuery('_id', ',', '$in'),
    globalHooks.splitQuery('tags', '+', '$all'),
    globalHooks.coerceQuery()
  ]

  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
}

exports.after = {
  // all: [],
  // find: [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
}
