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
          Model: db.collection('uoms'),
          paginate: databases.mongodb.metadata.paginate
        }

        // HACK: Monkey-patch the service to allow for string IDs
        );mongoService._objectifyId = id => {
          return id;
        };
        app.use('/uoms', mongoService

        // Get the wrapped service object, bind hooks
        );const uomService = app.service('/uoms');

        uomService.before(hooks.before);
        uomService.after(hooks.after);
      }));
    }
  };
}();