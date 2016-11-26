'use strict';

const hooks = require('./hooks');

class Service {
  // constructor (options) {}

  setup(app) {
    this.app = app;
  }

  find(params) {
    return this.app.service('/datastreams').find(params);
  }
}

module.exports = function () {
  return function () {
    const app = this;

    app.use('/datastreams/lookup', new Service());

    // Get the wrapped service object, bind hooks
    const lookupService = app.service('/datastreams/lookup');

    lookupService.before(hooks.before);
    lookupService.after(hooks.after);
  };
}();