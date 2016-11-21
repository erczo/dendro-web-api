const feathersQueryFilters = require('feathers-query-filters')
const hooks = require('./hooks')
const {Interval} = require('../../lib/utils')

class Service {
  constructor (options) {
    this.paginate = options.paginate || {}
  }

  setup (app) {
    this.app = app
  }

  find (params, callback) {
    const paginate = params && typeof params.paginate !== 'undefined' ? params.paginate : this.paginate
    const getFilter = feathersQueryFilters(params.query, paginate)
    const filters = getFilter.filters
    const query = getFilter.query

    // Evaluate the config instances based on sort order
    const datastream = params.datastream
    const config = filters.$sort.time === -1 ? datastream.datapoints_config.reverse() : datastream.datapoints_config

    // Construct interval for time query
    let queryInterval = Interval.empty()
    if (typeof query.time === 'object') {

    }

    // TODO: Finish me!!!

    // console.log(config)

    // callback(null, {'hello': 'world'})

    // const where = feathersSequelizeUtils.getWhere(query)
    // const order = feathersSequelizeUtils.getOrder(filters.$sort)
    // const q = {
    //   where: where,
    //   order: order,
    //   limit: filters.$limit
    //   // offset: filters.$skip - NO PAGINATION
    // }

    // if (filters.$select) {
    //   q.attributes = filters.$select
    // }

    // return this.Model.findAll(q).then(rows => {
    //   return {
    //     limit: filters.$limit,
    //     data: rows
    //   }
    // }).catch(feathersSequelizeUtils.errorHandler)
  }

  // find (params, callback) {
  //   /*
  //     1. Eval $sort, reverse configs if needed
  //     2. Create interval for time[] query field
  //     3. Iterate over configs, create Promise chain
  //    */

  //   const query = params.query

  //   // Eval $sort option
  //   if ((typeof query.$sort === 'object') && (query.$sort.time === '1')) {

  //     query.$sort = {local_date_time: -1} // Default to DESC
  //   } else if (typeof query.$sort.time !== 'undefined') {
  //     query.$sort = {local_date_time: query.$sort.time}
  //   }

  //   // const config = params.datastream.datapoints_config
  //   // const findTask = function (datastream) {
  //   //   return new Promise((resolve) => {
  //   //     // setImmediate(() => {

  //   //     //   resolve()
  //   //     // })
  //   //   })
  //   // }

  //   console.log(params.datastream.datapoints_config)
  //   callback(null, {'hello': 'world'})
  //   // return this.app.service('/legacy/datavalues').find(params)
  // }
}

module.exports = (function () {
  return function () {
    const app = this

    app.use('/datapoints', new Service({
      // TODO: Don't hardcode!
      paginate: {
        default: 20,
        max: 2000
      }
    }))

    // Get the wrapped service object, bind hooks
    const datapointService = app.service('/datapoints')

    datapointService.before(hooks.before)
    datapointService.after(hooks.after)
  }
})()
