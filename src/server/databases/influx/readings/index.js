const influx = require('influx')

module.exports = (function () {
  return function () {
    const app = this
    const readings = app.get('databases').influx.readings

    // Configure a new instance
    const client = influx(readings.url)

    readings.client = client
  }
})()
