'use strict';

const influx = require('influx');

module.exports = function () {
  return function () {
    const app = this;

    // Configure a new instance
    const client = influx(app.get('influx'));

    const databases = app.get('databases');

    databases.timeseries = {
      client: client
    };
  };
}();