const service = require('feathers-sequelize')
const hooks = require('./hooks')

module.exports = (function () {
  return function () {
    const app = this

    const options = {
      Model: app.get('databases').metadata.models.Datastream,
      paginate: {
        default: 20,
        max: 2000
      }
    }

    app.use('/datastreams', service(options))

    // Get the wrapped service object, bind hooks
    const datastreamService = app.service('/datastreams')

    datastreamService.before(hooks.before)
    datastreamService.after(hooks.after)
  }
})()
