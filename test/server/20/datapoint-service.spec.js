/**
 * Tests for datapoint and datapoint lookup services
 */

const commonHooks = require('feathers-hooks-common')
const memory = require('feathers-memory')

describe('Service /datapoints and /datapoints/lookup', function () {
  const databases = main.app.get('databases')

  const impDataMembers = [{
    t: new Date('2017-06-02T00:30:00.000Z'),
    o: -28800,
    v: 13.2,
    uv: 43.30708661417322
  }]
  const metDataMembers = [{
    t: new Date('2017-06-02T00:30:00.000Z'),
    o: -28800,
    v: 13.2,
    uv: 13.2
  }]
  const metPrefDataMembers = [{
    t: new Date('2017-06-02T00:30:00.000Z'),
    o: -28800,
    v: 13.2,
    uv: 1320
  }]

  const ascDataMembers = [{
    t: new Date('2017-06-01T00:10:00.000Z'),
    o: -28800,
    v: 11.1
  }]
  const descDataMembers = [{
    t: new Date('2017-06-02T00:30:00.000Z'),
    o: -28800,
    v: 13.2
  }]

  /*
    Create an in-memory Feathers service as a low-level datavalues provider.
   */

  main.app.use('/datavalues-ts2008', memory({
    paginate: {
      default: 200,
      max: 2000
    },
    store: {
      11: {
        ds_id: 1,
        t: new Date('2017-06-01T00:10:00.000Z'),
        o: -28800,
        v: 11.1
      },
      12: {
        ds_id: 1,
        t: new Date('2017-06-01T00:20:00.000Z'),
        o: -28800,
        v: 12.1
      },
      13: {
        ds_id: 1,
        t: new Date('2017-06-01T00:30:00.000Z'),
        o: -28800,
        v: 13.1
      },
      21: {
        ds_id: 2,
        t: new Date('2017-06-02T00:10:00.000Z'),
        o: -28800,
        v: 11.2
      },
      22: {
        ds_id: 2,
        t: new Date('2017-06-02T00:20:00.000Z'),
        o: -28800,
        v: 12.2
      },
      23: {
        ds_id: 2,
        t: new Date('2017-06-02T00:30:00.000Z'),
        o: -28800,
        v: 13.2
      }
    }
  }))

  // Get the wrapped service object, bind hooks
  main.app.service('/datavalues-ts2008').before({
    find: [
      (hook) => {
        /*
          Timeseries services must:
          * Support a 'compact' query field
          * Support a 'time[]' query field with operators $gt, $gte, $lt and $lte
          * Support a '$sort[time]' query field
          * Accept and return time values in simplified extended ISO format (ISO 8601)
         */

        const query = hook.params.query
        hook.params.compact = query.compact

        if (typeof query === 'object') {
          // Eval 'time' query field
          if (typeof query.time === 'object') {
            query.t = query.time
          }

          // Eval $sort query field
          if ((typeof query.$sort === 'object') && (typeof query.$sort.time !== 'undefined')) {
            query.$sort = {t: query.$sort.time}
          }
        }
      },

      commonHooks.removeQuery('compact', 'time', 'time_adjust')
    ]
  }).after({
    find: [
      (hook) => {
        if (!hook.params.compact) return

        const data = hook.result.data

        if (Array.isArray(data)) {
          hook.result.data = data.map(item => {
            return {t: item.t, o: item.o, v: item.v}
          })
        }
      }
    ]
  })

  let _idDatastream
  let _idDatastreamPref
  let _idStation

  before(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return Promise.all([
          db.collection('datastreams').remove({source: 'science.dendra.test.ts2008'}),
          db.collection('stations').remove({slug: 'ts2008-station'}),
          db.collection('uoms').remove({som_id: {$in: ['imp2008', 'met2008']}}),
          db.collection('soms').remove({_id: {$in: ['imp2008', 'met2008']}}),
          db.collection('vocabularies').remove({scheme_id: 'ts2008'}),
          db.collection('schemes').remove({_id: 'ts2008'})
        ])
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/scheme_ts2008.json'))
      }).then(doc => {
        return main.app.service('/schemes').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts2008-class.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/vocabulary_ts2008-unit.json'))
      }).then(doc => {
        return main.app.service('/vocabularies').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/som_imp2008.json'))
      }).then(doc => {
        return main.app.service('/soms').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/som_met2008.json'))
      }).then(doc => {
        return main.app.service('/soms').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/uom_imp2008-foot.json'))
      }).then(doc => {
        return main.app.service('/uoms').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/uom_met2008-centimeter.json'))
      }).then(doc => {
        return main.app.service('/uoms').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/uom_met2008-meter.json'))
      }).then(doc => {
        return main.app.service('/uoms').create(doc)
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/station_ts2008.json'))
      }).then(doc => {
        return main.app.service('/stations').create(doc)
      }).then(doc => {
        _idStation = doc._id
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2008.json'))
      }).then(doc => {
        doc.station_id = `${_idStation}`
        return main.app.service('/datastreams').create(doc)
      }).then(doc => {
        _idDatastream = doc._id
      }).then(() => {
        return helper.loadJSON(path.join(__dirname, 'data/datastream_ts2008-pref.json'))
      }).then(doc => {
        doc.station_id = `${_idStation}`
        return main.app.service('/datastreams').create(doc)
      }).then(doc => {
        _idDatastreamPref = doc._id
      })
    }

    this.skip()
  })

  after(function () {
    if (databases.mongodb && databases.mongodb.metadata) {
      return Promise.resolve(databases.mongodb.metadata.db).then(db => {
        return Promise.all([
          db.collection('datastreams').remove({source: 'science.dendra.test.ts2008'}),
          db.collection('stations').remove({slug: 'ts2008-station'}),
          db.collection('uoms').remove({som_id: {$in: ['imp2008', 'met2008']}}),
          db.collection('soms').remove({_id: {$in: ['imp2008', 'met2008']}}),
          db.collection('vocabularies').remove({scheme_id: 'ts2008'}),
          db.collection('schemes').remove({_id: 'ts2008'})
        ])
      })
    }
  })

  describe('/datapoints #find()', function () {
    it('should find using datastream_id', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastream
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(6).and.deep.include.ordered.members(descDataMembers)
      })
    })

    it('should find using datastream_id and time filter', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastream,
        time: {
          $gt: '2017-06-01T00:20:00.000Z',
          $lt: '2017-06-02T00:20:00.000Z'
        }
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(2)
      })
    })

    it('should find using datastream_id and local time filter', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastream,
        time: {
          $gt: '2017-05-31T16:20:00.000Z',
          $lt: '2017-06-01T16:20:00.000Z'
        },
        time_local: true
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(2)
      })
    })

    it('should find using datastream_id and $sort[time] ascending', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastream,
        $sort: {
          time: 1
        }
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(6).and.deep.include.ordered.members(ascDataMembers)
      })
    })

    it('should find using datastream_id and $sort[time] descending', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastream,
        $sort: {
          time: -1
        }
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(6).and.deep.include.ordered.members(descDataMembers)
      })
    })

    it('should find and convert using datastream_id and imperial som_id', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastream,
        som_id: 'imp2008'
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(6).and.deep.include.ordered.members(impDataMembers)
      })
    })

    it('should find and convert using datastream_id and metric som_id', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastream,
        som_id: 'met2008'
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(6).and.deep.include.ordered.members(metDataMembers)
      })
    })

    it('should find and convert using datastream_id and imperial som_id, with preference', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastreamPref,
        som_id: 'imp2008'
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(6).and.deep.include.ordered.members(impDataMembers)
      })
    })

    it('should find and convert using datastream_id and metric som_id, with preference', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastreamPref,
        som_id: 'met2008'
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(6).and.deep.include.ordered.members(metPrefDataMembers)
      })
    })

    it('should find and convert using datastream_id and imperial uom_id', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastream,
        uom_id: 'imp2008-foot'
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(6).and.deep.include.ordered.members(impDataMembers)
      })
    })

    it('should find and convert using datastream_id and metric uom_id', function () {
      return main.app.service('/datapoints').find({query: {
        datastream_id: _idDatastream,
        uom_id: 'met2008-meter'
      }}).then(res => {
        expect(res).to.have.property('data').lengthOf(6).and.deep.include.ordered.members(metDataMembers)
      })
    })
  })

  describe('/datapoints/lookup #find()', function () {
    it('should find using _id, passing one identifier string', function () {
      return main.app.service('/datapoints/lookup').find({query: {
        _id: `${_idDatastream}`
      }}).then(res => {
        expect(res).to.have.lengthOf(1)

        const datastream = res.find(ds => ds._id.equals(_idDatastream))
        expect(datastream).to.have.nested.property('datapoints.data').lengthOf(6).and.deep.include.ordered.members(descDataMembers)
      })
    })

    it('should find using _id, passing multiple identifier strings', function () {
      return main.app.service('/datapoints/lookup').find({query: {
        _id: `${_idDatastream},${_idDatastreamPref}`
      }}).then(res => {
        expect(res).to.have.lengthOf(2)

        const datastream = res.find(ds => ds._id.equals(_idDatastream))
        expect(datastream).to.have.nested.property('datapoints.data').lengthOf(6).and.deep.include.ordered.members(descDataMembers)

        const datastreamPref = res.find(ds => ds._id.equals(_idDatastreamPref))
        expect(datastreamPref).to.have.nested.property('datapoints.data').lengthOf(6).and.deep.include.ordered.members(descDataMembers)
      })
    })

    it('should find using station_id, passing one identifier string', function () {
      return main.app.service('/datapoints/lookup').find({query: {
        station_id: `${_idStation}`
      }}).then(res => {
        expect(res).to.have.lengthOf(2)

        const datastream = res.find(ds => ds._id.equals(_idDatastream))
        expect(datastream).to.have.nested.property('datapoints.data').lengthOf(6).and.deep.include.ordered.members(descDataMembers)

        const datastreamPref = res.find(ds => ds._id.equals(_idDatastreamPref))
        expect(datastreamPref).to.have.nested.property('datapoints.data').lengthOf(6).and.deep.include.ordered.members(descDataMembers)
      })
    })

    it('should find using imperial som_id and station_id, passing one identifier string', function () {
      return main.app.service('/datapoints/lookup').find({query: {
        som_id: 'imp2008',
        station_id: `${_idStation}`
      }}).then(res => {
        expect(res).to.have.lengthOf(2)

        const datastream = res.find(ds => ds._id.equals(_idDatastream))
        expect(datastream).to.have.nested.property('datapoints.data').lengthOf(6).and.deep.include.ordered.members(impDataMembers)

        const datastreamPref = res.find(ds => ds._id.equals(_idDatastreamPref))
        expect(datastreamPref).to.have.nested.property('datapoints.data').lengthOf(6).and.deep.include.ordered.members(impDataMembers)
      })
    })

    it('should find using metric som_id and station_id, passing one identifier string', function () {
      return main.app.service('/datapoints/lookup').find({query: {
        som_id: 'met2008',
        station_id: `${_idStation}`
      }}).then(res => {
        expect(res).to.have.lengthOf(2)

        const datastream = res.find(ds => ds._id.equals(_idDatastream))
        expect(datastream).to.have.nested.property('datapoints.data').lengthOf(6).and.deep.include.ordered.members(metDataMembers)

        const datastreamPref = res.find(ds => ds._id.equals(_idDatastreamPref))
        expect(datastreamPref).to.have.nested.property('datapoints.data').lengthOf(6).and.deep.include.ordered.members(metPrefDataMembers)
      })
    })
  })
})
