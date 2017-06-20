/**
 * Root level hooks
 */

before(function () {
  return main.app.get('serverReady')
})
