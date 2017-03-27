'use strict';

const feathersQueryFilters = require('feathers-query-filters');
const feathersSequelizeUtils = require('feathers-sequelize/lib/utils');
const hooks = require('./hooks');

/**
 * Low-level service to retrieve legacy datavalues.
 *
 * This is a custom service since we don't need pagination, and the pre-built
 * feathers-sequelize service uses findAndCount which adds the overhead of
 * SQL COUNT for every query.
 */
class Service {
  constructor(options) {
    this.paginate = options.paginate || {};
    this.Model = options.Model;
  }

  find(params) {
    /*
      Adapted from feathers-sequelize, modified to use findAll (faster!)
     */

    const paginate = params && typeof params.paginate !== 'undefined' ? params.paginate : this.paginate;
    const getFilter = feathersQueryFilters(params.query, paginate);
    const filters = getFilter.filters;
    const query = getFilter.query;
    const where = feathersSequelizeUtils.getWhere(query);
    const order = feathersSequelizeUtils.getOrder(filters.$sort);
    const q = {
      where: where,
      order: order,
      limit: filters.$limit
      // offset: filters.$skip - NO PAGINATION
    };

    if (filters.$select) {
      q.attributes = filters.$select;
    }

    return this.Model.findAll(q).then(rows => {
      return {
        limit: filters.$limit,
        data: rows
      };
    }).catch(feathersSequelizeUtils.errorHandler);
  }
}

module.exports = function () {
  return function () {
    const app = this;
    const databases = app.get('databases');

    if (databases.mysql && databases.mysql.legacy) {
      app.set('serviceReady', Promise.resolve(databases.mysql.legacy.models).then(models => {
        const bindService = function (model, path) {
          app.use(path, new Service({
            Model: model,
            paginate: databases.mysql.legacy.paginate
          }));

          // Get the wrapped service object, bind hooks
          const service = app.service(path);

          service.before(hooks.before);
          service.after(hooks.after);
        };

        bindService(models.datavalues2, '/legacy/datavalues2');
        bindService(models.datavalues_borr, '/legacy/datavalues-borr');
        bindService(models.datavalues_day, '/legacy/datavalues-day');
        bindService(models.datavalues_month, '/legacy/datavalues-month');
        bindService(models.datavalues_motes, '/legacy/datavalues-motes');
        bindService(models.datavalues_sagehen, '/legacy/datavalues-sagehen');
        bindService(models.datavalues_seasonal, '/legacy/datavalues-seasonal');
        bindService(models.datavalues_ucnrs, '/legacy/datavalues-ucnrs');
      }));
    }
  };
}();