'use strict';

const service = require('feathers-mongodb');
const hooks = require('./hooks');

module.exports = function () {
  return function () {
    const app = this;
    const databases = app.get('databases');

    if (databases.mongodb && databases.mongodb.metadata) {
      app.set('serviceReady', Promise.resolve(databases.mongodb.metadata.db).then(db => {
        app.use('/persons', service({
          Model: db.collection('persons'),
          paginate: databases.mongodb.metadata.paginate
        })

        // Get the wrapped service object, bind hooks
        );const personService = app.service('/persons');

        personService.before(hooks.before);
        personService.after(hooks.after);
      }));
    }
  };
}();