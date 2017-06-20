'use strict';

const service = require('feathers-mongodb');
const hooks = require('./hooks');

module.exports = function () {
  return function () {
    const app = this;
    const databases = app.get('databases');

    if (databases.mongodb && databases.mongodb.metadata) {
      app.set('serviceReady', Promise.resolve(databases.mongodb.metadata.db).then(db => {
        const mongoService = service({
          Model: db.collection('schemes'),
          paginate: databases.mongodb.metadata.paginate
        }

        // HACK: Monkey-patch the service to allow for string IDs
        );mongoService._objectifyId = id => {
          return id;
        };
        app.use('/schemes', mongoService

        // Get the wrapped service object, bind hooks
        );const schemeService = app.service('/schemes');

        schemeService.before(hooks.before);
        schemeService.after(hooks.after);
      }));
    }
  };
}();