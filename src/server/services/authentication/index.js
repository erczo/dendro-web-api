const authentication = require('feathers-authentication')

module.exports = (function () {
  return function () {
    const app = this

    let config = app.get('auth')

    app.configure(authentication(config))
  }
})()
