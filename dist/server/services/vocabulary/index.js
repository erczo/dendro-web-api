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
          Model: db.collection('vocabularies'),
          paginate: databases.mongodb.metadata.paginate
        }

        // HACK: Monkey-patch the service to allow for string IDs
        );mongoService._objectifyId = id => {
          return id;
        };
        app.use('/vocabularies', mongoService

        // Get the wrapped service object, bind hooks
        );const vocabularyService = app.service('/vocabularies');

        vocabularyService.before(hooks.before);
        vocabularyService.after(hooks.after);
      }));
    }
  };
}();