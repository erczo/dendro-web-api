'use strict';

const Influx = require('influx');

module.exports = function () {
  return function () {
    const app = this;
    const readings = app.get('databases').influx.readings;

    // Configure a new instance
    // TODO: Revise this - driver has changed!
    const client = new Influx.InfluxDB(readings.url);

    readings.client = client;
  };
}();