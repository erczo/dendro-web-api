/**
 * Tests for som service
 */

describe('Service /soms', function () {
  const databases = main.app.get('databases')

  before(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return db.collection('soms').remove({_id: 'imp2004'})
      })
    }

    this.skip()
  })

  after(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return db.collection('soms').remove({_id: 'imp2004'})
      })
    }
  })

  describe('#create()', function () {
    it('should create without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/som_imp2004.json')).then(doc => {
        return main.app.service('/soms').create(doc)
      }).then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })

  describe('#get()', function () {
    it('should get without error', function () {
      return main.app.service('/soms').get('imp2004').then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })

  describe('#find()', function () {
    it('should find without error', function () {
      return main.app.service('/soms').find({query: {name: 'IMP2004 System of Measurement'}}).then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })
  })

  describe('#update()', function () {
    it('should update without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/som_imp2004.update.json')).then(doc => {
        return main.app.service('/soms').update('imp2004', doc)
      }).then(doc => {
        expect(doc).to.have.property('name', 'IMP2004 System of Measurement - Updated')
      })
    })
  })

  describe('#remove()', function () {
    it('should remove without error', function () {
      return main.app.service('/soms').remove('imp2004').then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })
})
