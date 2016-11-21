const MongoClient = require('mongodb').MongoClient

module.exports = (function () {
  return function () {
    const app = this
    const metadata = app.get('databases').mongodb.metadata

    // Configure a new instance
    metadata.db = MongoClient.connect(metadata.url, metadata.options)
  }
})()
