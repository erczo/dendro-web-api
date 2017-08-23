/**
 * Tests for datastream service
 */

describe('Service /datastreams', function () {
  const databases = main.app.get('databases')

  const unitTerm = {
    abbreviation: 'm',
    label: 'Meter',
    scheme_id: 'ts2003',
    scheme_priority: 1,
    vocabulary_id: 'ts2003-unit',
    vocabulary_label: 'Unit',
    vocabulary_type: 'unit'
  }
  const unitTermUpdated = {
    abbreviation: 'mm',
    label: 'Millimeter',
    scheme_id: 'ts2003',
    scheme_priority: 1,
    vocabulary_id: 'ts2003-unit',
    vocabulary_label: 'Unit',
    vocabulary_type: 'unit'
  }
  const tagsInfo = {
    resolved_terms: [{
      label: 'TermA',
      scheme_id: 'ts2003',
      scheme_priority: 1,
      vocabulary_id: 'ts2003-class',
      vocabulary_label: 'Class',
      vocabulary_type: 'class'
    }, unitTerm],
    unit_tag: 'ts2003_Unit_Meter',
    unit_term: unitTerm,
    scheme_refs: [{
      _id: 'ts2003',
      tag_count: 2
    }],
    vocabulary_refs: [{
      _id: 'ts2003-class'
    }, {
      _id: 'ts2003-unit'
    }]
  }
  const tagsInfoUpdated = {
    resolved_terms: [{
      label: 'TermB',
      scheme_id: 'ts2003',
      scheme_priority: 1,
      vocabulary_id: 'ts2003-class',
      vocabulary_label: 'Class',
      vocabulary_type: 'class'
    }, unitTermUpdated],
    unit_tag: 'ts2003_Unit_Millimeter',
    unit_term: unitTermUpdated,
    scheme_refs: [{
      _id: 'ts2003',
      tag_count: 2
    }],
    vocabulary_refs: [{
      _id: 'ts2003-class'
    }, {
      _id: 'ts2003-unit'
    }]
  }

  before(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return Promise.all([
          db.collection('datastreams').remove({source: 'science.dendra.test.ts2003'}),
          db.collection('uoms').remove({_id: 'imp2003-a'}),
          db.collection('vocabularies').remove({scheme_id: 'ts2003'}),
          db.collection('schemes').remove({_id: 'ts2003'})
        ])
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/scheme_ts2003.json'))
      }).then(doc => {
        return main.app.service('/schemes').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts2003-class.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts2003-unit.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/uom_imp2003-a.json'))
      }).then(doc => {
        return main.app.service('/uoms').create(doc)
      })
    }
  })

  after(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return Promise.all([
          db.collection('datastreams').remove({source: 'science.dendra.test.ts2003'}),
          db.collection('uoms').remove({_id: 'imp2003-a'}),
          db.collection('vocabularies').remove({scheme_id: 'ts2003'}),
          db.collection('schemes').remove({_id: 'ts2003'})
        ])
      })
    }
  })

  let _id

  describe('#create()', function () {
    it('should create without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2003.json')).then(doc => {
        return main.app.service('/datastreams').create(doc)
      }).then(doc => {
        expect(doc).to.have.property('_id')
        expect(doc).to.have.property('uom')
        expect(doc).to.have.property('preferred_uoms').lengthOf(1)

        /*
          Validate computed fields
         */

        assert.deepEqual(doc.attributes_info, {
          sort: {
            value1: 10,
            value2: 0
          },
          text: '10 m',
          unit_term: unitTerm
        })

        assert.deepEqual(doc.tags_info, tagsInfo)

        assert.deepEqual(doc.hashes, [
          {key: 'src', str: '41b35abaa0eaec10bc60a38f8e4966ba589732fa'},
          {key: 'att', str: '6c0c2db35668f13b2ad8df4c79defdfe40a71a0b'},
          {key: 'geo', str: '50d69564798973c593fdf1c54fc338b32da2ebbe'},
          {key: 'tag', str: '9aa6a847b0f1fe1a2f32060e75aa46049d74257c', scheme_id: 'ts2003'},
          {key: 'ent', str: 'a1d1d0fbd27a2b7db9be0f30cb5006b0562c86e8', scheme_id: 'ts2003'}
        ])

        _id = doc._id
      })
    })
  })

  describe('#get()', function () {
    it('should get without error', function () {
      return main.app.service('/datastreams').get(_id).then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })

  describe('#find()', function () {
    it('should find without error', function () {
      return main.app.service('/datastreams').find({query: {source: 'science.dendra.test.ts2003'}}).then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })
  })

  describe('#update()', function () {
    it('should update without error', function () {
      return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2003.update.json')).then(doc => {
        return main.app.service('/datastreams').update(_id, doc)
      }).then(doc => {
        expect(doc).to.have.property('name', 'TS2003 Datastream - Updated')
        expect(doc).to.have.property('tags').lengthOf(2)
        expect(doc).to.have.property('uom')
        expect(doc).to.have.property('preferred_uoms').lengthOf(1)

        /*
          Validate computed fields
         */

        assert.deepEqual(doc.attributes_info, {
          sort: {
            value1: 10000,
            value2: 0
          },
          text: '10000 mm',
          unit_term: unitTermUpdated
        })

        assert.deepEqual(doc.tags_info, tagsInfoUpdated)

        assert.deepEqual(doc.hashes, [
          {key: 'src', str: '41b35abaa0eaec10bc60a38f8e4966ba589732fa'},
          {key: 'att', str: 'd69d3a0f7808278d8ce26bd6721ce5def5510a3b'},
          {key: 'geo', str: '50d69564798973c593fdf1c54fc338b32da2ebbe'},
          {key: 'tag', str: 'ce3c904803be5a6e2a8308ea79c2f89969df2403', scheme_id: 'ts2003'},
          {key: 'ent', str: '8f76edb9f335f11d7f4ec016186319f28b91d276', scheme_id: 'ts2003'}
        ])
      })
    })
  })

  describe('#remove()', function () {
    it('should remove without error', function () {
      return main.app.service('/datastreams').remove(_id).then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })
})
