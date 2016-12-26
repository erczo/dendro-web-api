const globalHooks = require('../../../hooks')
// const hooks = require('feathers-hooks')

// TODO: Allow POST request for longer query params?

exports.before = {
  // all: [],

  find: [
    globalHooks.splitQuery('_id', ',', '$in'),
    // TODO: Make this accept a list of tags?
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
