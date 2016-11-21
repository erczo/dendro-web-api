'use strict';

const service = require('feathers-mongodb');
const hooks = require('./hooks');

module.exports = function () {
  return function () {
    const app = this;
    const databases = app.get('databases');

    if (databases.mongodb && databases.mongodb.metadata) {
      app.set('serviceReady', Promise.resolve(databases.mongodb.metadata.db).then(db => {
        app.use('/memberships', service({
          Model: db.collection('memberships'),
          paginate: databases.mongodb.metadata.paginate
        }));

        // Get the wrapped service object, bind hooks
        const membershipService = app.service('/memberships');

        membershipService.before(hooks.before);
        membershipService.after(hooks.after);
      }));
    }
  };
}();