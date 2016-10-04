const hooks = require('./hooks')

class Service {
  constructor (options) {
    this.client = options.client
  }

  find (params, callback) {
    //
    // TODO: This needs work!!!
    // NOTE: Basically, this ONLY demonstrates that we can run an Influx query within a Feathers service
    //

    console.log('params', params)

    let q = `SELECT * FROM "${params.query.measurement_name}" ORDER BY time DESC LIMIT 5`

    console.log('q', q)

    this.client.query(q, callback)
  }
}

module.exports = (function () {
  return function () {
    const app = this

    const options = {
      client: app.get('databases').timeseries.client
    }

    app.use('/points', new Service(options))

    // Get the wrapped service object, bind hooks
    const pointsService = app.service('/points')

    pointsService.before(hooks.before)
    pointsService.after(hooks.after)
  }
})()
