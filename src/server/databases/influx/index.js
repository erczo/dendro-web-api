module.exports = (function () {
  return function () {
    const app = this
    const influx = app.get('databases').influx

    if (influx.readings) app.configure(require('./readings'))
  }
})()
