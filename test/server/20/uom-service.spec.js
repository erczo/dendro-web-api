/**
 * Tests for uom service
 */

describe('Service /uoms', function () {
  const databases = main.app.get('databases')

  before(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return db.collection('uoms').remove({_id: 'imp2005-a'})
      })
    }

    this.skip()
  })

  after(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return db.collection('uoms').remove({_id: 'imp2005-a'})
      })
    }
  })

  describe('#create()', function () {
    it('should create without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/uom_imp2005-a.json')).then(doc => {
        return main.app.service('/uoms').create(doc)
      }).then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })

  describe('#get()', function () {
    it('should get without error', function () {
      return main.app.service('/uoms').get('imp2005-a').then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })

  describe('#find()', function () {
    it('should find without error', function () {
      return main.app.service('/uoms').find({query: {som_id: 'imp2005'}}).then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })
  })

  describe('#update()', function () {
    it('should update without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/uom_imp2005-a.update.json')).then(doc => {
        return main.app.service('/uoms').update('imp2005-a', doc)
      }).then(doc => {
        expect(doc).to.have.deep.property('convertible_to_uom_ids', [
          'imp2005-d'
        ])
        expect(doc).to.have.property('unit_tags').lengthOf(1)
      })
    })
  })

  describe('#remove()', function () {
    it('should remove without error', function () {
      return main.app.service('/uoms').remove('imp2005-a').then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })
})
