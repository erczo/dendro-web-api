'use strict';

const metadata = require('./metadata');
// const timeseries = require('./timeseries')

module.exports = function () {
  return function () {
    const app = this;

    app.set('databases', {});

    app.configure(metadata);
    // app.configure(timeseries)
  };
}();