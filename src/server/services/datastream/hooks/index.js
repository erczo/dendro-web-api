const globalHooks = require('../../../hooks')
// const hooks = require('feathers-hooks')

// TODO: Prepare schemna and enable validation
// const SCHEMA_NAME = 'datastream.json'

exports.before = {
  // all: [],

  find: [
    globalHooks.coerceQuery()
  ],

  // get: [],

  create: [
    // globalHooks.validate(SCHEMA_NAME),
    globalHooks.timestamp(),
    globalHooks.coerce()
  ],

  update: [
    // globalHooks.validate(SCHEMA_NAME),
    globalHooks.timestamp(),
    globalHooks.coerce(),

    (hook) => {
      // TODO: Optimize with find/$select to return fewer fields?
      return hook.app.service('/schemes').get(hook.id).then(doc => {
        hook.data.created_at = doc.created_at
        return hook
      })
    }
  ],

  // NOTE: Relies solely on Mongo document validation
  patch: [
    globalHooks.timestamp(),
    globalHooks.coerce()
  ]

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
