const feathers = require('feathers')
const restClient = require('feathers-rest/client')
const request = require('request')

module.exports = (function () {
  return function () {
    const app = this
    const noaa = app.get('connections').noaa

    noaa.app = feathers()
      .configure(restClient(noaa.url).request(request))
  }
})()
