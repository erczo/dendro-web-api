'use strict';

const service = require('feathers-mongodb');
const hooks = require('./hooks');

module.exports = function () {
  return function () {
    const app = this;
    const databases = app.get('databases');

    if (databases.mongodb && databases.mongodb.metadata) {
      app.set('serviceReady', Promise.resolve(databases.mongodb.metadata.db).then(db => {
        app.use('/datastreams', service({
          Model: db.collection('datastreams'),
          paginate: databases.mongodb.metadata.paginate
        }));

        // Get the wrapped service object, bind hooks
        const datastreamService = app.service('/datastreams');

        datastreamService.before(hooks.before);
        datastreamService.after(hooks.after);
      }));
    }
  };
}();