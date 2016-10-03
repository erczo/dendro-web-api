const authentication = require('./authentication')
const datastream = require('./datastream')

module.exports = (function () {
  return function () {
    const app = this

    app.configure(authentication)
    app.configure(datastream)
  }
})()
