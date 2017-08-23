'use strict';

const commonHooks = require('feathers-hooks-common');
const globalHooks = require('../../../hooks');

// TODO: Allow POST request for longer query params?

exports.before = {
  // all: [],

  find: [globalHooks.splitList('params.query._id'), globalHooks.splitList('params.query.source'), globalHooks.splitList('params.query.station_id'), globalHooks.coerceQuery()],

  get: commonHooks.disallow(),
  create: commonHooks.disallow(),
  update: commonHooks.disallow(),
  patch: commonHooks.disallow(),
  remove: commonHooks.disallow()
};

exports.after = {
  // all: [],

  find(hook) {
    /*
      If a system of measurement is given, then do a fuzzy match by only returning datastreams that are already in
      or could be converted to the designated system of measurement.
     */
    const datastreams = hook.result;
    const query = hook.params.query;

    if (typeof query === 'object' && typeof query.som_id === 'string' && Array.isArray(datastreams)) {
      const existing = {};
      let newDatastreams = [];

      // Gather all entity hash strings to help us identify 'similar' datastreams
      const hashStrings = datastreams.reduce((obj, datastream) => {
        const hashes = datastream.hashes;
        if (Array.isArray(hashes)) {
          const entHash = hashes.find(hash => hash.key === 'ent');
          if (entHash) obj[`${datastream._id}`] = entHash.str;
        }
        return obj;
      }, {});

      return hook.app.service('/soms').get(query.som_id).then(som => {
        /*
          Set up a promise chain to select datastreams for each system of measurement. Start with the selected
          system of measurement, then continue with the fallback measurements.
           Do everything async-ish.
         */
        let step = Promise.resolve();
        const somIds = [...new Set([som._id, ...(som.fallback_som_ids || [])])];
        somIds.forEach(somId => {
          step = step.then(() => {
            return new Promise(resolve => {
              setImmediate(() => {
                const filtered = datastreams.filter(datastream => {
                  const hashStr = hashStrings[`${datastream._id}`];

                  if (hashStr && datastream.uom && datastream.uom.som_id === somId) {
                    const exists = existing[hashStr];
                    existing[hashStr] = true;
                    return !exists;
                  }
                  return false;
                });

                newDatastreams = newDatastreams.concat(filtered);

                resolve();
              });
            });
          });
        });

        return step;
      }).then(() => {
        return new Promise(resolve => {
          /*
            Lastly, include datastreams that have neither a unit nor system of measurement.
           */
          setImmediate(() => {
            const filtered = datastreams.filter(datastream => {
              const hashStr = hashStrings[`${datastream._id}`];

              if (hashStr && !(datastream.uom && datastream.uom.som_id)) {
                const exists = existing[hashStr];
                existing[hashStr] = true;
                return !exists;
              }
              return false;
            });

            newDatastreams = newDatastreams.concat(filtered);

            resolve();
          });
        });
      }).then(() => {
        hook.result = newDatastreams;
        return hook;
      });
    }
  }

  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
};