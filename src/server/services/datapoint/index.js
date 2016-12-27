const feathersQueryFilters = require('feathers-query-filters')
const hooks = require('./hooks')
const {Interval} = require('../../lib/utils')

// Reasonable min and max dates to perform low-level querying
// NOTE: Didn't use min/max integer since db date conversion could choke
const MIN_TIME = Date.UTC(1000, 0, 1)
const MAX_TIME = Date.UTC(3000, 0, 1)

/**
 * High-level service that provides a standard facade to retrieve datapoints.
 *
 * This service forwards 'find' requests to one or more low-level services
 * registered under datapoints_config.
 */
class Service {
  constructor (options) {
    this.paginate = options.paginate || {}
  }

  setup (app) {
    this.app = app
  }

  find (params) {
    /*
      Standard Feathers service preamble, adapted from feathers-sequelize.
     */

    const paginate = params && typeof params.paginate !== 'undefined' ? params.paginate : this.paginate
    const getFilter = feathersQueryFilters(params.query, paginate)
    const filters = getFilter.filters
    const query = getFilter.query

    /*
      Efficiently merge config instances in a linear traversal by evaluating
      each instance's date/time interval [begins_at, ends_before).

      Steps:
      1. Filter instances based on required fields, enabled, etc.
      2. Convert begins_at/ends_before to time; deal with nulls
      3. Sort instances by beginsAt
      4. Exclude, merge or adjust intervals
      5. Do a final reorder based on $sort.time
     */

    // TODO: Break this into smaller methods?

    const stack = []
    const datastream = params.datastream
    let config = (typeof datastream === 'object') && Array.isArray(datastream.datapoints_config) ? datastream.datapoints_config : []

    config.filter(inst => {
      return typeof inst.path === 'string'
    }).map(inst => {
      return {
        beginsAt: inst.begins_at instanceof Date ? inst.begins_at.getTime() : MIN_TIME,
        endsBefore: inst.ends_before instanceof Date ? inst.ends_before.getTime() : MAX_TIME,
        params: inst.params,
        path: inst.path
      }
    }).sort((a, b) => {
      if (a.beginsAt < b.beginsAt) return -1
      if (a.beginsAt > b.beginsAt) return 1
      return 0
    }).forEach(inst => {
      if (inst.endsBefore <= inst.beginsAt) {
        // Exclude: inverted interval
      } else if (stack.length === 0) {
        stack.push(inst) // Init stack
      } else {
        const top = stack[stack.length - 1]

        if (inst.beginsAt >= top.endsBefore) {
          stack.push(inst)
        } else if (inst.endsBefore <= top.endsBefore) {
          // Exclude: instance interval is within top interval
        } else if (inst.beginsAt === top.beginsAt) {
          stack.pop()
          stack.push(inst)
        } else {
          top.endsBefore = inst.beginsAt
          stack.push(inst)
        }
      }
    })

    // Points can only be sorted by 'time' (default DESC)
    filters.$sort = {
      time: typeof filters.$sort.time === 'undefined' ? -1 : filters.$sort.time
    }
    config = filters.$sort.time === -1 ? stack.reverse() : stack

    /*
      Construct a query interval based on 'time' query field.
     */

    const queryInterval = new Interval(MIN_TIME, MAX_TIME, false, true)

    if (typeof query.time === 'object') {
      const queryTime = query.time

      if (queryTime.$gt instanceof Date) {
        queryInterval.start = queryTime.$gt.getTime()
        queryInterval.leftOpen = true
      } else if (queryTime.$gte instanceof Date) {
        queryInterval.start = queryTime.$gte.getTime()
        queryInterval.leftOpen = false // Closed interval
      }

      if (queryTime.$lt instanceof Date) {
        queryInterval.end = queryTime.$lt.getTime()
        queryInterval.rightOpen = true
      } else if (queryTime.$lte instanceof Date) {
        queryInterval.end = queryTime.$lte.getTime()
        queryInterval.rightOpen = false // Closed interval
      }
    }

    /*
      Iterate over config instances; set-up a promise chain to query low-level
      services where the query interval intersects the instance's interval.
     */

    let result = Promise.resolve({
      limit: filters.$limit,
      data: []
    })
    config.forEach(inst => {
      // Intersect intervals; skip querying if empty
      const interval = queryInterval.intersect(new Interval(inst.beginsAt, inst.endsBefore, false, true))
      if (interval.empty) return

      result = result.then(outerRes => {
        /*
          Construct a low-level query using the clamped interval and config
          instance fields. Do this only if we haven't reached our limit.
         */

        if (outerRes.data.length >= filters.$limit) return outerRes

        // NOTE: The following may modify the in-memory datastream object
        const params = typeof inst.params === 'object' ? inst.params : {}
        if (typeof params.query !== 'object') params.query = {}
        params.query.$limit = filters.$limit - outerRes.data.length
        params.query.$sort = filters.$sort
        params.query.compact = true
        params.query.time = {}
        params.query.time[interval.leftOpen ? '$gt' : '$gte'] = new Date(interval.start)
        params.query.time[interval.rightOpen ? '$lt' : '$lte'] = new Date(interval.end)

        // Call the low-level service!
        return this.app.service(inst.path).find(params).then(innerRes => {
          // Combine the results
          // TODO: Not the most efficient, optimize somehow?
          if (Array.isArray(innerRes.data)) outerRes.data = outerRes.data.concat(innerRes.data)
          return outerRes
        })
      })
    })

    return result
  }
}

module.exports = (function () {
  return function () {
    const app = this
    const services = app.get('services')

    if (services.datapoint) {
      app.use('/datapoints', new Service({
        paginate: services.datapoint.paginate
      }))

      // Get the wrapped service object, bind hooks
      const datapointService = app.service('/datapoints')

      datapointService.before(hooks.before)
      datapointService.after(hooks.after)
    }
  }
})()
