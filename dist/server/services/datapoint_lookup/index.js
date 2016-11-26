'use strict';

const hooks = require('./hooks');

class Service {
  // constructor (options) {}

  setup(app) {
    this.app = app;
  }

  find(params) {
    const datastreams = Array.isArray(params.datastreams) ? params.datastreams : [];
    const tasks = datastreams.map(datastream => {
      return this.app.service('/datapoints').find({
        datastream: datastream,
        query: params.query
      }).then(res => {
        return {
          datastream_id: datastream._id,
          datapoints: res
        };
      });
    });

    return Promise.all(tasks);
  }
}

module.exports = function () {
  return function () {
    const app = this;

    app.use('/datapoints/lookup', new Service());

    // Get the wrapped service object, bind hooks
    const lookupService = app.service('/datapoints/lookup');

    lookupService.before(hooks.before);
    lookupService.after(hooks.after);
  };
}();