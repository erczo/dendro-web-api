/**
 * Tests for vocabulary service
 */

describe('Service /vocabularies', function () {
  const databases = main.app.get('databases')

  before(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return db.collection('vocabularies').remove({_id: 'ts2002-vocabulary'})
      })
    }
  })

  after(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return db.collection('vocabularies').remove({_id: 'ts2002-vocabulary'})
      })
    }
  })

  describe('#create()', function () {
    it('should create without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts2002-vocabulary.json')).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })

  describe('#get()', function () {
    it('should get without error', function () {
      return main.app.service('/vocabularies').get('ts2002-vocabulary').then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })

  describe('#find()', function () {
    it('should find without error', function () {
      return main.app.service('/vocabularies').find({query: {label: 'Vocabulary', scheme_id: 'ts2002'}}).then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })
  })

  describe('#update()', function () {
    it('should update without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts2002-vocabulary.update.json')).then(doc => {
        return main.app.service('/vocabularies').update('ts2002-vocabulary', doc)
      }).then(doc => {
        expect(doc).to.have.property('label', 'VocabularyUpdated')
      })
    })
  })

  describe('#remove()', function () {
    it('should remove without error', function () {
      return main.app.service('/vocabularies').remove('ts2002-vocabulary').then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })
})
