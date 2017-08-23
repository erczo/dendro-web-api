/**
 * Tests for datastream lookup service
 */

const {ObjectID} = require('mongodb')

describe('Service /datastreams/lookup', function () {
  const databases = main.app.get('databases')

  let _id6a
  let _id6b
  let _id6c
  let _id7aFoot
  let _id7aMeter
  let _id7bFoot
  let _id7bMeter

  before(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return Promise.all([
          db.collection('datastreams').remove({source: {$in: ['science.dendra.test.ts2006', 'science.dendra.test.ts2007']}}),
          db.collection('uoms').remove({som_id: {$in: ['imp2007', 'met2007']}}),
          db.collection('soms').remove({_id: {$in: ['imp2007', 'met2007']}}),
          db.collection('vocabularies').remove({scheme_id: {$in: ['ts2006', 'ts2007']}}),
          db.collection('schemes').remove({_id: {$in: ['ts2006', 'ts2007']}})
        ])
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/scheme_ts2006.json'))
      }).then(doc => {
        return main.app.service('/schemes').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/scheme_ts2007.json'))
      }).then(doc => {
        return main.app.service('/schemes').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts2006-class1.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts2006-class2.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts2007-unit.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/som_imp2007.json'))
      }).then(doc => {
        return main.app.service('/soms').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/som_met2007.json'))
      }).then(doc => {
        return main.app.service('/soms').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/uom_imp2007-foot.json'))
      }).then(doc => {
        return main.app.service('/uoms').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/uom_met2007-meter.json'))
      }).then(doc => {
        return main.app.service('/uoms').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2006-a.json'))
      }).then(doc => {
        return main.app.service('/datastreams').create(doc)
      }).then(doc => {
        _id6a = doc._id
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2006-b.json'))
      }).then(doc => {
        return main.app.service('/datastreams').create(doc)
      }).then(doc => {
        _id6b = doc._id
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2006-c.json'))
      }).then(doc => {
        return main.app.service('/datastreams').create(doc)
      }).then(doc => {
        _id6c = doc._id
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2007-a-foot.json'))
      }).then(doc => {
        return main.app.service('/datastreams').create(doc)
      }).then(doc => {
        _id7aFoot = doc._id
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2007-a-meter.json'))
      }).then(doc => {
        return main.app.service('/datastreams').create(doc)
      }).then(doc => {
        _id7aMeter = doc._id
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2007-b-foot.json'))
      }).then(doc => {
        return main.app.service('/datastreams').create(doc)
      }).then(doc => {
        _id7bFoot = doc._id
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2007-b-meter.json'))
      }).then(doc => {
        return main.app.service('/datastreams').create(doc)
      }).then(doc => {
        _id7bMeter = doc._id
      })
    }
  })

  after(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return Promise.all([
          db.collection('datastreams').remove({source: {$in: ['science.dendra.test.ts2006', 'science.dendra.test.ts2007']}}),
          db.collection('uoms').remove({som_id: {$in: ['imp2007', 'met2007']}}),
          db.collection('soms').remove({_id: {$in: ['imp2007', 'met2007']}}),
          db.collection('vocabularies').remove({scheme_id: {$in: ['ts2006', 'ts2007']}}),
          db.collection('schemes').remove({_id: {$in: ['ts2006', 'ts2007']}})
        ])
      })
    }
  })

  describe('#find()', function () {
    /*
      _id parameter tests
     */

    it('should not find using _id, passing non-matching identifier string', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        _id: 'ABC'
      }}).then(res => {
        expect(res).to.have.lengthOf(0)
      })
    })

    it('should find using _id, passing one identifier string', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        _id: `${_id6a}`
      }}).then(res => {
        expect(res).to.have.lengthOf(1)
      })
    })

    it('should find using _id, passing multiple identifier strings', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        _id: `${_id6a},${_id6b}`
      }}).then(res => {
        expect(res).to.have.lengthOf(2)
      })
    })

    it('should find using _id, passing array of identifiers', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        _id: [`${_id6a}`, new ObjectID(_id6b)]
      }}).then(res => {
        expect(res).to.have.lengthOf(2)
      })
    })

    /*
      source parameter tests
     */

    it('should not find using source, passing non-matching value string', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        source: 'ABC'
      }}).then(res => {
        expect(res).to.have.lengthOf(0)
      })
    })

    it('should find using source, passing one value string', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        source: 'science.dendra.test.ts2006'
      }}).then(res => {
        expect(res).to.have.lengthOf(3)
      })
    })

    it('should find using source, passing multiple value strings', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        source: 'science.dendra.test.ts2006,science.dendra.test.ts2007'
      }}).then(res => {
        expect(res).to.have.lengthOf(7)
      })
    })

    it('should find using source, passing array of values', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        source: ['science.dendra.test.ts2006', 'science.dendra.test.ts2007']
      }}).then(res => {
        expect(res).to.have.lengthOf(7)
      })
    })

    /*
      station_id parameter tests
     */

    it('should not find using station_id, passing non-matching identifier string', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        station_id: 'ABC'
      }}).then(res => {
        expect(res).to.have.lengthOf(0)
      })
    })

    it('should find using station_id, passing one identifier string', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        station_id: '592f155746a1b867a114e060'
      }}).then(res => {
        expect(res).to.have.lengthOf(1)
      })
    })

    it('should find using station_id, passing multiple identifier strings', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        station_id: '592f155746a1b867a114e060,592f155746a1b867a114e061'
      }}).then(res => {
        expect(res).to.have.lengthOf(2)
      })
    })

    it('should find using station_id, passing array of identifiers', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        station_id: ['592f155746a1b867a114e060', new ObjectID('592f155746a1b867a114e061')]
      }}).then(res => {
        expect(res).to.have.lengthOf(2)
      })
    })

    /*
      id_, source, and station_id parameter tests
     */

    it('should find using id_, source, and station_id', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        _id: `${_id6a}`,
        source: 'science.dendra.test.ts2006',
        station_id: '592f155746a1b867a114e062,592f155746a1b867a114e063'
      }}).then(res => {
        expect(res).to.have.lengthOf(7)
      })
    })

    it('should find using id_, source, station_id, and attributes_exists true', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        _id: `${_id6a}`,
        source: 'science.dendra.test.ts2006',
        station_id: '592f155746a1b867a114e062,592f155746a1b867a114e063',
        attributes_exists: true
      }}).then(res => {
        expect(res).to.have.lengthOf(4)
      })
    })

    it('should find using id_, source, station_id, and attributes_exists false', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        _id: `${_id6a}`,
        source: 'science.dendra.test.ts2006',
        station_id: '592f155746a1b867a114e062,592f155746a1b867a114e063',
        attributes_exists: false
      }}).then(res => {
        expect(res).to.have.lengthOf(4)
      })
    })

    it('should find using id_, source, station_id, and tags', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        _id: `${_id6a}`,
        source: 'science.dendra.test.ts2006',
        station_id: '592f155746a1b867a114e062,592f155746a1b867a114e063',
        tags: 'ts2006_Class1_Term1A.ts2007_Unit_Meter'
      }}).then(res => {
        expect(res).to.have.lengthOf(2)
      })
    })

    it('should find using id_, source, station_id, and tags_exact', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        _id: `${_id6a}`,
        source: 'science.dendra.test.ts2006',
        station_id: '592f155746a1b867a114e062,592f155746a1b867a114e063',
        tags: 'ts2006_Class1_Term1B.ts2006_Class2_Term2B.ts2007_Unit_Meter',
        tags_exact: true
      }}).then(res => {
        expect(res).to.have.lengthOf(3)
      })
    })

    it('should not find using source, station_id, and tags_exact', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        source: 'science.dendra.test.ts2006',
        station_id: '592f155746a1b867a114e062,592f155746a1b867a114e063',
        tags: 'ts2006_Class1_Term1B.ts2007_Unit_Meter',
        tags_exact: true
      }}).then(res => {
        expect(res).to.have.lengthOf(0)
      })
    })

    /*
      som_id parameter tests
     */

    it('should find using source and imperial som_id', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        source: 'science.dendra.test.ts2006,science.dendra.test.ts2007',
        som_id: 'imp2007'
      }}).then(res => {
        expect(res).to.have.lengthOf(5).and.satisfy(datastreams => {
          return datastreams.find(ds => ds._id.equals(_id6a)) &&
            datastreams.find(ds => ds._id.equals(_id6b)) &&
            datastreams.find(ds => ds._id.equals(_id6c)) &&
            datastreams.find(ds => ds._id.equals(_id7aFoot)) &&
            datastreams.find(ds => ds._id.equals(_id7bFoot))
        })
      })
    })

    it('should find using source and metric som_id', function () {
      return main.app.service('/datastreams/lookup').find({query: {
        source: 'science.dendra.test.ts2006,science.dendra.test.ts2007',
        som_id: 'met2007'
      }}).then(res => {
        expect(res).to.have.lengthOf(5).and.satisfy(datastreams => {
          return datastreams.find(ds => ds._id.equals(_id6a)) &&
            datastreams.find(ds => ds._id.equals(_id6b)) &&
            datastreams.find(ds => ds._id.equals(_id6c)) &&
            datastreams.find(ds => ds._id.equals(_id7aMeter)) &&
            datastreams.find(ds => ds._id.equals(_id7bMeter))
        })
      })
    })
  })
})
