'use strict';

const Logger = require('mongodb').Logger;

module.exports = function () {
  return function () {
    const app = this;
    const mongodb = app.get('databases').mongodb;

    if (mongodb.defaultLogger) {
      // Configure logging
      const defaultLogger = mongodb.defaultLogger;
      if (defaultLogger.level) Logger.setLevel(defaultLogger.level);

      // Set our own logger
      // TODO: Replace logger with winston; handle this centrally
      // SEE: http://mongodb.github.io/node-mongodb-native/2.0/tutorials/logging/
      // Logger.setCurrentLogger((msg, context) => {
      //   console.log(msg, context)
      // })
    }

    if (mongodb.metadata) app.configure(require('./metadata'));
  };
}();