/**
 * Tests for global hooks
 */

const globalHooks = require('../../../dist/server/hooks')
const {ObjectID} = require('mongodb')

describe('Global hooks', function () {
  const date1Str = '2017-05-05T15:00:00.000Z'
  const date2Str = '2017-06-06T16:30:10Z'
  const date1 = new Date(date1Str)
  const date2 = new Date(date2Str)
  const id1Str = '592f155746a1b867a114e010'
  const id2Str = '592f155746a1b867a114e020'
  const id1 = new ObjectID(id1Str)
  const id2 = new ObjectID(id2Str)

  describe('#coerceQuery()', function () {
    it('should coerce object ids in query params', function () {
      const hook = {
        params: {
          query: {
            _id: id1,
            str_id: id1Str,
            ary_ids: [id1Str, id2Str],
            obj: {
              one_id: id1Str,
              two: {two_id: id2Str}
            }
          }
        }
      }

      globalHooks.coerceQuery()(hook)

      assert.isOk(hook.params.query._id.equals(id1), '_id equals id1')
      assert.isOk(hook.params.query.str_id.equals(id1), 'str_id equals id1')
      assert.isOk(hook.params.query.ary_ids[0].equals(id1), 'ary_ids[0] equals id1')
      assert.isOk(hook.params.query.ary_ids[1].equals(id2), 'ary_ids[1] equals id2')
      assert.isOk(hook.params.query.obj.one_id.equals(id1), 'obj.one_id equals id1')
      assert.isOk(hook.params.query.obj.two.two_id.equals(id2), 'obj.two.two_id equals id2')
    })

    it('should coerce values in query params', function () {
      const hook = {
        params: {
          query: {
            bool_value: true,
            bool_value_str: 'true',
            bool_value_ary: ['false', 'true'],
            bool_value_obj: {
              f: 'false',
              t: {t: 'true'}
            },
            num_value: 12.3,
            num_value_str: '4.56',
            num_value_ary: ['7.89', '010.110'],
            num_value_obj: {
              one: '-1.1',
              two: {two: '-2.2'}
            },
            date_value: date1,
            date_value_str: date1Str,
            date_value_ary: [date1Str, date2Str],
            date_value_obj: {
              one: date1Str,
              two: {two: date2Str}
            },
            str_value: 'abc',
            str_value_num: '\'123',
            str_value_ary: ['def', 'GHI'],
            str_value_obj: {
              one: 'One',
              two: {two: 'Two'}
            }
          }
        }
      }

      globalHooks.coerceQuery()(hook)

      assert.deepEqual(hook.params.query, {
        bool_value: true,
        bool_value_str: true,
        bool_value_ary: [false, true],
        bool_value_obj: {
          f: false,
          t: {t: true}
        },
        num_value: 12.3,
        num_value_str: 4.56,
        num_value_ary: [7.89, 10.11],
        num_value_obj: {
          one: -1.1,
          two: {two: -2.2}
        },
        date_value: date1,
        date_value_str: date1,
        date_value_ary: [date1, date2],
        date_value_obj: {
          one: date1,
          two: {two: date2}
        },
        str_value: 'abc',
        str_value_num: '\'123',
        str_value_ary: ['def', 'GHI'],
        str_value_obj: {
          one: 'One',
          two: {two: 'Two'}
        }
      })
    })
  })

  // TODO: Remove - deprecated
  // describe('#parseBoolQuery()', function () {
  //   it('should coerce true for truthy query params', function () {
  //     const hook = {
  //       params: {
  //         query: {
  //           value1: 'true',
  //           value2: '1'
  //         }
  //       }
  //     }

  //     globalHooks.parseBoolQuery('value1')(hook)
  //     globalHooks.parseBoolQuery('value2')(hook)

  //     assert.deepEqual(hook.params.query, {
  //       value1: true,
  //       value2: true
  //     })
  //   })

  //   it('should coerce false for falsey query params', function () {
  //     const hook = {
  //       params: {
  //         query: {
  //           value1: 'truex',
  //           value2: '0'
  //         }
  //       }
  //     }

  //     globalHooks.parseBoolQuery('value1')(hook)
  //     globalHooks.parseBoolQuery('value2')(hook)

  //     assert.deepEqual(hook.params.query, {
  //       value1: false,
  //       value2: false
  //     })
  //   })
  // })

  // TODO: Remove - deprecated
  // describe('#parseIntQuery()', function () {
  //   it('should coerce integers in query params', function () {
  //     const hook = {
  //       params: {
  //         query: {
  //           value1: '10.10',
  //           value2: '020',
  //           value3: '0',
  //           value4: '-4',
  //           value5: 'a'
  //         }
  //       }
  //     }

  //     globalHooks.parseIntQuery('value1')(hook)
  //     globalHooks.parseIntQuery('value2')(hook)
  //     globalHooks.parseIntQuery('value3')(hook)
  //     globalHooks.parseIntQuery('value4')(hook)
  //     globalHooks.parseIntQuery('value5')(hook)
  //     globalHooks.parseIntQuery('value6', 6)(hook) // Test defaultValue

  //     assert.deepEqual(hook.params.query, {
  //       value1: 10,
  //       value2: 20,
  //       value3: 0,
  //       value4: -4,
  //       value5: 0,
  //       value6: 6
  //     })
  //   })
  // })
})
