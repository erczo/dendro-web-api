const globalHooks = require('../../../hooks')
// const hooks = require('feathers-hooks')
const {errors} = require('feathers-errors')
const {treeMap} = require('../../../lib/utils')

exports.before = {
  // all: [],

  find: [
    globalHooks.parseBoolQuery('time_local'),
    globalHooks.coerceQuery(),

    (hook) => {
      const query = hook.params.query
      if (query.datastream_id) {
        return hook.app.service('/datastreams').get(query.datastream_id).then(datastream => {
          hook.params.datastream = datastream
          return hook
        })
      }
    },

    (hook) => {
      const datastream = hook.params.datastream
      if (typeof datastream !== 'object') throw new errors.BadRequest('Expected datastream')
      if (!Array.isArray(datastream.datapoints_config)) throw new errors.GeneralError('Missing datapoints config')
    },

    (hook) => {
      /*
        Treat the time[] query field as local station time if time_local is true.
       */

      const datastream = hook.params.datastream
      const query = hook.params.query

      if ((typeof query.time === 'object') && query.time_local && datastream.station_id) {
        return hook.app.service('/stations').get(datastream.station_id).then(station => {
          const offset = station.utc_offset
          if (typeof offset === 'number') {
            // Convert station time to UTC for downstream use
            query.time = treeMap(query.time, (obj) => {
              // Only map values that were coerced, i.e. in the correct format
              if (obj instanceof Date) return new Date(obj.getTime() - offset * 1000)
              return obj
            })
          }
          return hook
        })
      }
    }
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
