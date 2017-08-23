/**
 * Tests for organization service
 */

describe('Service /organizations', function () {
  const databases = main.app.get('databases')

  before(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return db.collection('organizations').remove({email: 'org_test_one@test.dendra.science'})
      })
    }
  })

  after(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return db.collection('organizations').remove({email: 'org_test_one@test.dendra.science'})
      })
    }
  })

  let _id

  describe('#create()', function () {
    it('should create without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/organization_test_one.json')).then(doc => {
        return main.app.service('/organizations').create(doc)
      }).then(doc => {
        expect(doc).to.have.property('_id')

        _id = doc._id
      })
    })
  })

  describe('#get()', function () {
    it('should get without error', function () {
      return main.app.service('/organizations').get(_id).then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })

  describe('#find()', function () {
    it('should find without error', function () {
      return main.app.service('/organizations').find({query: {email: 'org_test_one@test.dendra.science'}}).then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })
  })

  describe('#update()', function () {
    it('should update without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/organization_test_one.update.json')).then(doc => {
        return main.app.service('/organizations').update(_id, doc)
      }).then(doc => {
        expect(doc).to.have.property('name', 'Test One Org - Updated')
      })
    })
  })

  describe('#remove()', function () {
    it('should remove without error', function () {
      return main.app.service('/organizations').remove(_id).then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })
})
