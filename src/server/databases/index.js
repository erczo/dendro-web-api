module.exports = (function () {
  return function () {
    const app = this
    const databases = app.get('databases')

    if (databases.influx) app.configure(require('./influx'))
    if (databases.mongodb) app.configure(require('./mongodb'))
    if (databases.mysql) app.configure(require('./mysql'))
  }
})()
