const authentication = require('./authentication')
const datastream = require('./datastream')
const points = require('./points')

module.exports = (function () {
  return function () {
    const app = this

    app.configure(authentication)
    app.configure(datastream)
    app.configure(points)
  }
})()
