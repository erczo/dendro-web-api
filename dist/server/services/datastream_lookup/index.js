'use strict';

const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.limit = Number.isInteger(options.limit) ? options.limit : 100;
  }

  setup(app) {
    this.app = app;
  }

  find(params) {
    /*
      Find up to 100 datastreams based on the query parameters (ordered by _id). This endpoint evaluates the _id,
      source, and station_id parameters in a logical disjunction (OR). The attributes_exist and tags parameters
      can be added to further restrict datastreams selected by the source and station_id parameters.
     */
    const query = params.query;
    if (typeof query !== 'object') return [];

    const newQuery = {
      $limit: this.limit,
      $sort: { _id: 1 }
    };
    const subQuery = {
      enabled: true
    };
    const conditions = newQuery.$or = [];

    if (Array.isArray(query._id)) {
      conditions.push({
        _id: { $in: query._id }
      });
    }

    if (typeof query.attributes_exists === 'boolean') {
      subQuery.attributes = {
        $exists: query.attributes_exists
      };
    }

    if (typeof query.tags === 'string') {
      const tags = [...new Set(query.tags.split('.'))];

      /*
        The $all operator selects the documents where the value of a field is an array that contains all the
        specified elements.
       */
      subQuery.tags = {
        $all: tags
      };

      if (query.tags_exact === true) {
        /*
          Perform an EXACT match on the given vocabulary tags. This simply means that all tags for a given
          vocabulary scheme much be present on the datastream.
         */

        // Build a scheme refs array based on the given tags
        const refs = [];
        tags.map(tag => {
          return tag.split('_');
        }).forEach(parts => {
          // We only support tags in the format <schemeId>_<vocabularyLabel>_<termLabel>
          if (parts.length !== 3) return;

          const schemeId = parts[0];
          const ref = refs.find(ref => ref._id === schemeId);
          if (ref) {
            ref.tag_count++;
          } else {
            refs.push({
              _id: schemeId,
              tag_count: 1
            });
          }
        });

        subQuery.$and = refs.map(ref => {
          return {
            'tags_info.scheme_refs': {
              $elemMatch: ref
            }
          };
        });
      }
    }

    if (Array.isArray(query.source)) {
      conditions.push(Object.assign({
        source: { $in: query.source }
      }, subQuery));
    }

    if (Array.isArray(query.station_id)) {
      conditions.push(Object.assign({
        station_id: { $in: query.station_id }
      }, subQuery));
    }

    return this.app.service('/datastreams').find({ query: newQuery }).then(res => {
      return res.data;
    });
  }
}

module.exports = function () {
  return function () {
    const app = this;
    const services = app.get('services');

    if (services.datastream_lookup) {
      app.use('/datastreams/lookup', new Service({
        limit: services.datastream_lookup.limit
      })

      // Get the wrapped service object, bind hooks
      );const lookupService = app.service('/datastreams/lookup');

      lookupService.before(hooks.before);
      lookupService.after(hooks.after);
    }
  };
}();