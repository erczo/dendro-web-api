/**
 * Tests for system services
 */

describe('Service /system/time', function () {
  describe('#get()', function () {
    it('should get without error', function () {
      return main.app.service('/system/time').get('utc').then(doc => {
        expect(doc).to.have.property('now')
      })
    })
  })
})

describe('Service /system/schemas', function () {
  describe('#find()', function () {
    it('should get without error', function () {
      return main.app.service('/system/schemas').find().then(res => {
        expect(res).to.have.property('data').lengthOf(13)
      })
    })
  })
})
