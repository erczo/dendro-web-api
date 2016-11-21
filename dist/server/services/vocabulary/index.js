'use strict';

const service = require('feathers-mongodb');
const hooks = require('./hooks');

module.exports = function () {
  return function () {
    const app = this;
    const databases = app.get('databases');

    if (databases.mongodb && databases.mongodb.metadata) {
      app.set('serviceReady', Promise.resolve(databases.mongodb.metadata.db).then(db => {
        app.use('/vocabularies', service({
          Model: db.collection('vocabularies'),
          paginate: databases.mongodb.metadata.paginate
        }));

        // Get the wrapped service object, bind hooks
        const vocabularyService = app.service('/vocabularies');

        vocabularyService.before(hooks.before);
        vocabularyService.after(hooks.after);
      }));
    }
  };
}();