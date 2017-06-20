/**
 * Tests for scheme service
 */

describe('Service /schemes', function () {
  const databases = main.app.get('databases')

  before(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return db.collection('schemes').remove({_id: 'ts2001'})
      })
    }

    this.skip()
  })

  after(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return db.collection('schemes').remove({_id: 'ts2001'})
      })
    }
  })

  describe('#create()', function () {
    it('should create without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/scheme_ts2001.json')).then(doc => {
        return main.app.service('/schemes').create(doc)
      }).then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })

  describe('#get()', function () {
    it('should get without error', function () {
      return main.app.service('/schemes').get('ts2001').then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })

  describe('#find()', function () {
    it('should find without error', function () {
      return main.app.service('/schemes').find({query: {name: 'TS2001 Scheme'}}).then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })
  })

  describe('#update()', function () {
    it('should update without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/scheme_ts2001.update.json')).then(doc => {
        return main.app.service('/schemes').update('ts2001', doc)
      }).then(doc => {
        expect(doc).to.have.property('name', 'TS2001 Scheme - Updated')
      })
    })
  })

  describe('#remove()', function () {
    it('should remove without error', function () {
      return main.app.service('/schemes').remove('ts2001').then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })
})
