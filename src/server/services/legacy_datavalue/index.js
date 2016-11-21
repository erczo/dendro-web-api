const feathersQueryFilters = require('feathers-query-filters')
const feathersSequelizeUtils = require('feathers-sequelize/lib/utils')
const hooks = require('./hooks')

/**
 * Custom service since we don't need pagination, and the pre-built feathers-sequelize
 * service uses findAndCount which adds the overhead of SQL COUNT for every query.
 */
class Service {
  constructor (options) {
    this.paginate = options.paginate || {}
    this.Model = options.Model
  }

  find (params) {
    /*
      Adapted from feathers-sequelize, modified to use findAll (faster!)
     */

    const paginate = params && typeof params.paginate !== 'undefined' ? params.paginate : this.paginate
    const getFilter = feathersQueryFilters(params.query, paginate)
    const filters = getFilter.filters
    const query = getFilter.query
    const where = feathersSequelizeUtils.getWhere(query)
    const order = feathersSequelizeUtils.getOrder(filters.$sort)
    const q = {
      where: where,
      order: order,
      limit: filters.$limit
      // offset: filters.$skip - NO PAGINATION
    }

    if (filters.$select) {
      q.attributes = filters.$select
    }

    return this.Model.findAll(q).then(rows => {
      return {
        limit: filters.$limit,
        data: rows
      }
    }).catch(feathersSequelizeUtils.errorHandler)
  }
}

module.exports = (function () {
  return function () {
    const app = this
    const databases = app.get('databases')

    if (databases.mysql && databases.mysql.legacy) {
      app.set('serviceReady',
        Promise.resolve(databases.mysql.legacy.models).then(models => {
          app.use('/legacy/datavalues', new Service({
            Model: models.Datavalue,
            paginate: databases.mysql.legacy.paginate
          }))

          // Get the wrapped service object, bind hooks
          const datavalueService = app.service('/legacy/datavalues')

          datavalueService.before(hooks.before)
          datavalueService.after(hooks.after)
        }))
    }
  }
})()
