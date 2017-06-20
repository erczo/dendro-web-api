import math from '../../../lib/math'

const commonHooks = require('feathers-hooks-common')
const globalHooks = require('../../../hooks')
const {errors} = require('feathers-errors')
const {getByDot} = require('feathers-hooks-common')
const {treeMap} = require('../../../lib/utils')

exports.before = {
  // all: [],

  find: [
    globalHooks.coerceQuery(),

    (hook) => {
      if (typeof hook.params.query !== 'object') throw new errors.BadRequest('Expected query')
    },

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
        If a system of measurement is given, then resolve the SOM to a valid unit of measurement.
       */
      const datastream = hook.params.datastream
      const query = hook.params.query

      if ((typeof query.som_id === 'string') && (typeof datastream.uom === 'object') && Array.isArray(datastream.convertible_to_uoms)) {
        const sourceUom = datastream.uom
        const sourceSomId = sourceUom.som_id
        const targetSomId = query.som_id

        let foundUom

        if (Array.isArray(datastream.preferred_uoms)) {
          let defaultUom
          // Seek out a preferred UOM for the given system of measurement
          foundUom = datastream.preferred_uoms.find(uom => {
            // The default is the first UOM that does not have a system
            if (!defaultUom && !uom.som_id) defaultUom = uom._id
            return uom.som_id === targetSomId
          }) || defaultUom

          if (foundUom) {
            // Verify the chosen, preferred UOM against the convertibles
            foundUom = datastream.convertible_to_uoms.find(uom => uom._id === foundUom._id)
          }
        }

        if (foundUom) {
          // We have a preference, this supersedes all
          hook.params.sourceUom = sourceUom
          hook.params.targetUom = foundUom
        } else if (targetSomId === sourceSomId) {
          // We are already in the given system of measurement
          hook.params.sourceUom = hook.params.targetUom = sourceUom
        } else {
          // Seek out a convertible UOM for the given system of measurement
          foundUom = datastream.convertible_to_uoms.find(uom => uom.som_id === targetSomId)

          if (foundUom) {
            hook.params.sourceUom = sourceUom
            hook.params.targetUom = foundUom
          }
        }
      }
    },

    (hook) => {
      /*
        If a unit of measurement is given, then verify the target UOM here. We convert values in the after hook.
       */
      const datastream = hook.params.datastream
      const query = hook.params.query

      if ((typeof query.uom_id === 'string') && (typeof datastream.uom === 'object') && Array.isArray(datastream.convertible_to_uoms)) {
        const sourceUom = datastream.uom
        const sourceUomId = sourceUom._id
        const targetUomId = query.uom_id

        if (targetUomId === sourceUomId) {
          // We are already in the given unit of measurement
          hook.params.sourceUom = hook.params.targetUom = sourceUom
        } else {
          // Verify the given UOM against the convertibles
          const foundUom = datastream.convertible_to_uoms.find(uom => uom._id === targetUomId)
          if (!foundUom) throw new errors.BadRequest(`Not convertible to '${targetUomId}'`)

          hook.params.sourceUom = sourceUom
          hook.params.targetUom = foundUom
        }
      }
    },

    (hook) => {
      /*
        Treat the time[] query field as local station time if time_local is true.
       */
      const datastream = hook.params.datastream
      const query = hook.params.query

      if ((typeof query.time === 'object') && (query.time_local === true) && datastream.station_id) {
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
  ],

  get: commonHooks.disallow(),
  create: commonHooks.disallow(),
  update: commonHooks.disallow(),
  patch: commonHooks.disallow(),
  remove: commonHooks.disallow()
}

exports.after = {
  // all: [],

  find (hook) {
    const sourceUnitName = getByDot(hook, 'params.sourceUom.library_config.mathjs.unit_name')
    const targetUnitName = getByDot(hook, 'params.targetUom.library_config.mathjs.unit_name')

    if (!sourceUnitName || !targetUnitName) return

    // Convert results asynchronously; 20 items at a time (hardcoded)
    // TODO: Move hardcoded 'count' to config
    // TODO: Move this into a global hook?
    const count = 20
    const data = hook.result.data
    const mapTask = function (start) {
      return new Promise(resolve => {
        setImmediate(() => {
          const len = Math.min(start + count, data.length)
          for (let i = start; i < len; i++) {
            const item = data[i]
            if (typeof item.v === 'number') {
              // Be cautious, bypass conversion if the same unit name
              item.uv = sourceUnitName === targetUnitName ? item.v : math.unit(item.v, sourceUnitName).toNumber(targetUnitName)
            }
          }
          resolve()
        })
      })
    }
    const tasks = []
    for (let i = 0; i < data.length; i += count) {
      tasks.push(mapTask(i))
    }
    return Promise.all(tasks).then(() => {
      return hook
    })
  }

  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
}
