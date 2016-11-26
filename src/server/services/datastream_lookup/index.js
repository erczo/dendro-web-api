const hooks = require('./hooks')

class Service {
  constructor (options) {
    this.limit = Number.isInteger(options.limit) ? options.limit : 100
  }

  setup (app) {
    this.app = app
  }

  find (params) {
    const query = {
      $limit: this.limit,
      $sort: {_id: 1}
    }

    // Only allow specific query fields for lookup
    if (params.query._id) query._id = params.query._id
    if (params.query.tags) query.tags = params.query.tags
    if (params.query.station_id) query.station_id = params.query.station_id

    return this.app.service('/datastreams').find({query: query}).then(res => {
      return res.data
    })
  }
}

module.exports = (function () {
  return function () {
    const app = this
    const services = app.get('services')

    if (services.datastream_lookup) {
      app.use('/datastreams/lookup', new Service({
        limit: services.datastream_lookup.limit
      }))

      // Get the wrapped service object, bind hooks
      const lookupService = app.service('/datastreams/lookup')

      lookupService.before(hooks.before)
      lookupService.after(hooks.after)
    }
  }
})()
