'use strict';

const hooks = require('./hooks');

class Service {
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
        const obj = {};

        // Include lightweight datastream metadata
        obj._id = datastream._id;
        if (datastream.attributes) obj.attributes = datastream.attributes;
        if (datastream.station_id) obj.station_id = datastream.station_id;
        if (datastream.tags) obj.tags = datastream.tags;
        obj.datapoints = res;

        return obj;
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