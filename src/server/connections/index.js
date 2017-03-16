module.exports = (function () {
  return function () {
    const app = this
    const connections = app.get('connections')

    if (connections.noaa) app.configure(require('./noaa'))
  }
})()
