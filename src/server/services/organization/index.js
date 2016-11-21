const service = require('feathers-mongodb')
const hooks = require('./hooks')

module.exports = (function () {
  return function () {
    const app = this
    const databases = app.get('databases')

    if (databases.mongodb && databases.mongodb.metadata) {
      app.set('serviceReady',
        Promise.resolve(databases.mongodb.metadata.db).then(db => {
          app.use('/organizations', service({
            Model: db.collection('organizations'),
            paginate: databases.mongodb.metadata.paginate
          }))

          // Get the wrapped service object, bind hooks
          const organizationService = app.service('/organizations')

          organizationService.before(hooks.before)
          organizationService.after(hooks.after)
        }))
    }
  }
})()
