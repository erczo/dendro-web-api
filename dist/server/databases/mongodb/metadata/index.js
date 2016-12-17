'use strict';

const MongoClient = require('mongodb').MongoClient;

module.exports = function () {
  return function () {
    const app = this;
    const metadata = app.get('databases').mongodb.metadata;

    // Configure a new instance
    metadata.db = new Promise((resolve, reject) => {
      const tryConnect = function tryConnect() {
        MongoClient.connect(metadata.url, metadata.options).then(db => {
          resolve(db);
        }).catch(() => {
          // If database service is unavailable, then retry
          // TODO: Don't hardcode retry interval
          // TODO: Add max retries?
          setTimeout(tryConnect, 5000);
        });
      };
      tryConnect();
    });
  };
}();