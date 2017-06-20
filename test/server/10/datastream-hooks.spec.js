/**
 * Tests for datastream hooks
 */

const hooks = require('../../../dist/server/services/datastream/hooks')
const {ObjectID} = require('mongodb')

describe('Datastream hooks', function () {
  const databases = main.app.get('databases')

  const tags = [
    'ts1001_Class1_Term1A',
    'ts1001_Class2_Term2B',
    'ts1001_Unit_Meter',
    'ts1002_Unit_Meter'
  ]
  const unitTerm = {
    abbreviation: 'm',
    label: 'Meter',
    scheme_id: 'ts1001',
    scheme_priority: 1,
    vocabulary_id: 'ts1001-unit',
    vocabulary_label: 'Unit',
    vocabulary_type: 'unit'
  }
  const tagsInfo = {
    resolved_terms: [{
      label: 'Term1A',
      scheme_id: 'ts1001',
      scheme_priority: 1,
      vocabulary_id: 'ts1001-class1',
      vocabulary_label: 'Class1',
      vocabulary_type: 'class'
    }, {
      label: 'Term2B',
      scheme_id: 'ts1001',
      scheme_priority: 1,
      vocabulary_id: 'ts1001-class2',
      vocabulary_label: 'Class2'
    }, unitTerm, {
      abbreviation: '(m)',
      label: 'Meter',
      scheme_id: 'ts1002',
      scheme_priority: 2,
      vocabulary_id: 'ts1002-unit',
      vocabulary_label: 'Unit',
      vocabulary_type: 'unit'
    }],
    unit_tag: 'ts1001_Unit_Meter',
    unit_term: unitTerm,
    scheme_refs: [{
      _id: 'ts1001',
      tag_count: 3
    }, {
      _id: 'ts1002',
      tag_count: 1
    }],
    vocabulary_refs: [{
      _id: 'ts1001-class1'
    }, {
      _id: 'ts1001-class2'
    }, {
      _id: 'ts1001-unit'
    }, {
      _id: 'ts1002-unit'
    }]
  }

  before(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return Promise.all([
          db.collection('schemes').remove({_id: 'ts1001'}),
          db.collection('vocabularies').remove({_id: 'ts1001-unit'})
        ])
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/scheme_ts1001.json'))
      }).then(doc => {
        return main.app.service('/schemes').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/scheme_ts1002.json'))
      }).then(doc => {
        return main.app.service('/schemes').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts1001-class1.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts1001-class2.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts1001-unit.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts1002-unit.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      })
    }

    this.skip()
  })

  after(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return Promise.all([
          db.collection('schemes').remove({_id: 'ts1001'}),
          db.collection('schemes').remove({_id: 'ts1002'}),
          db.collection('vocabularies').remove({scheme_id: 'ts1001'}),
          db.collection('vocabularies').remove({scheme_id: 'ts1002'})
        ])
      })
    }
  })

  describe('#getTagsInfo()', function () {
    it('should compute info for tags', function () {
      return hooks.getTagsInfo(tags, main.app).then(info => {
        assert.deepEqual(info, tagsInfo)
      })
    })
  })

  describe('#computeAttributesInfo()', function () {
    it('should compute info for delta meter', function () {
      const hook = {
        app: main.app,
        data: {
          attributes: {
            height: {
              unit_tag: 'ts1001_Unit_Meter',
              delta: [12, 1.5]
            }
          }
        }
      }

      return hooks.computeAttributesInfo()(hook).then(() => {
        assert.deepEqual(hook.data.attributes_info, {
          sort: {
            value1: 12,
            value2: 1.5
          },
          text: '12-1.5 m',
          unit_term: unitTerm
        })
      })
    })

    it('should compute info for range meter', function () {
      const hook = {
        app: main.app,
        data: {
          attributes: {
            height: {
              unit_tag: 'ts1001_Unit_Meter',
              range: [12, 15.5]
            }
          }
        }
      }

      return hooks.computeAttributesInfo()(hook).then(() => {
        assert.deepEqual(hook.data.attributes_info, {
          sort: {
            value1: 12,
            value2: 3.5
          },
          text: '12...15.5 m',
          unit_term: unitTerm
        })
      })
    })

    it('should compute info for value meter', function () {
      const hook = {
        app: main.app,
        data: {
          attributes: {
            height: {
              unit_tag: 'ts1001_Unit_Meter',
              value: -15.5
            }
          }
        }
      }

      return hooks.computeAttributesInfo()(hook).then(() => {
        assert.deepEqual(hook.data.attributes_info, {
          sort: {
            value1: -15.5,
            value2: 0
          },
          text: '-15.5 m',
          unit_term: unitTerm
        })
      })
    })
  })

  describe('#computeTagsInfo()', function () {
    it('should compute info for tags', function () {
      const hook = {
        app: main.app,
        data: {
          tags: tags
        }
      }

      return hooks.computeTagsInfo()(hook).then(() => {
        assert.deepEqual(hook.data.tags_info, tagsInfo)
      })
    })
  })

  describe('#computeHashes()', function () {
    it('should compute hashes for tags info', function () {
      const hook = {
        app: main.app,
        data: {
          attributes: {
            height: {
              unit_tag: 'ts1001_Unit_Meter',
              value: 10
            }
          },
          source: 'science.dendra.test.ts1001',
          station_id: new ObjectID('592f155746a1b867a114e060'),
          tags_info: tagsInfo
        }
      }

      return hooks.computeHashes()(hook).then(() => {
        assert.deepEqual(hook.data.hashes, [
          {key: 'src', str: '9870a06b6c7ff1fb3a47ffd92ef1405cae096381'},
          {key: 'att', str: '19dfce8db7027752022c50e1a07826beaa2a7ed4'},
          {key: 'geo', str: 'da39a3ee5e6b4b0d3255bfef95601890afd80709'},
          {key: 'tag', str: '39ee5c22ea9c1c7ac48519cbef949982c5a33d10', scheme_id: 'ts1001'},
          {key: 'tag', str: 'ca6f018c9e3f49e78acdb502a2a37defa4010767', scheme_id: 'ts1002'},
          {key: 'ent', str: '76c84f34ac9c8ec9b33976ca2e170f197d2371dd', scheme_id: 'ts1001'}
        ])
      })
    })
  })
})
