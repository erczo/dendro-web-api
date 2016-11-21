const service = require('feathers-mongodb')
const hooks = require('./hooks')

module.exports = (function () {
  return function () {
    const app = this
    const databases = app.get('databases')

    if (databases.mongodb && databases.mongodb.metadata) {
      app.set('serviceReady',
        Promise.resolve(databases.mongodb.metadata.db).then(db => {
          app.use('/schemes', service({
            Model: db.collection('schemes'),
            paginate: databases.mongodb.metadata.paginate
          }))

          // Get the wrapped service object, bind hooks
          const schemeService = app.service('/schemes')

          schemeService.before(hooks.before)
          schemeService.after(hooks.after)
        }))
    }
  }
})()
