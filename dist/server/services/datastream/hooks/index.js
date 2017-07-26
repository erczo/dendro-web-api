'use strict';

const commonHooks = require('feathers-hooks-common');
const globalHooks = require('../../../hooks');
const { asyncHashDigest } = require('../../../lib/utils');
const { errors } = require('feathers-errors');

const SCHEMA_NAME = 'datastream.json';

function getTagsInfo(tags, app) {
  const schemeService = app.service('/schemes');
  const vocabularyService = app.service('/vocabularies');

  const info = {
    resolved_terms: [],
    scheme_refs: [],
    vocabulary_refs: []

    /*
      Iterate over tags; set up a promise chain to parse and resolve each tag.
     */
  };let step = Promise.resolve();
  tags.forEach(tag => {
    const parts = tag.split('_'

    // We only support tags in the format <schemeId>_<vocabularyLabel>_<termLabel>
    );if (parts.length !== 3) return;

    const [schemeId, vLabel, tLabel] = parts;
    let scheme;

    step = step.then(() => {
      return schemeService.get(schemeId);
    }).then(doc => {
      scheme = doc;
    }).then(() => {
      return vocabularyService.find({
        query: {
          scheme_id: schemeId,
          label: vLabel,
          'terms.label': tLabel
        },
        $limit: 1,
        $sort: { _id: 1 }
      });
    }).then(res => {
      if (!res || !res.data || res.data.length < 1) throw new errors.BadRequest(`No vocabulary or term found for tag '${tag}'`);

      const vocab = res.data[0];
      const term = vocab.terms.find(t => t.label === tLabel // Should exist since data was found

      );if (!term) throw new errors.BadRequest(`No term found for tag '${tag}'`);

      const resolved = {};

      if (term.abbreviation) resolved.abbreviation = term.abbreviation;
      resolved.label = term.label;
      resolved.scheme_id = scheme._id;
      resolved.scheme_priority = typeof scheme.priority === 'number' ? scheme.priority : 10;
      resolved.vocabulary_id = vocab._id;
      resolved.vocabulary_label = vocab.label;
      if (vocab.vocabulary_type) resolved.vocabulary_type = vocab.vocabulary_type;

      info.resolved_terms.push(resolved

      // The predominant unit designation; based on the scheme with the highest priority
      );if (vocab.vocabulary_type === 'unit' && (!info.unit_term || info.unit_term.scheme_priority > resolved.scheme_priority)) {
        info.unit_tag = tag;
        info.unit_term = resolved;
      }

      const schemeRef = info.scheme_refs.find(ref => ref._id === vocab.scheme_id);
      if (schemeRef) {
        schemeRef.tag_count++;
      } else {
        info.scheme_refs.push({
          _id: vocab.scheme_id,
          tag_count: 1
        });
      }

      const vocabRef = info.vocabulary_refs.find(ref => ref._id === vocab._id);
      if (!vocabRef) {
        info.vocabulary_refs.push({
          _id: vocab._id
        });
      }
    });
  });

  return step.then(() => info);
}

exports.getTagsInfo = getTagsInfo; // For testing

/**
 * Populate information about this datastream's attributes.
 */
function computeAttributesInfo() {
  return hook => {
    delete hook.data.attributes_info;

    const data = hook.data;
    const attrs = data.attributes;
    if (typeof attrs !== 'object') return;

    const info = data.attributes_info = {
      sort: {
        value1: 0,
        value2: 0
      },
      text: ''
    };

    const firstKey = Object.keys(attrs)[0];
    if (!firstKey) return;

    const obj = attrs[firstKey];
    if (typeof obj !== 'object') return;

    /*
      Infer a sort values and text based on numeric attribute fields.
       We only support certain attribute constructs, e.g. delta, range and value.
     */
    const parts = [];
    if (Array.isArray(obj.delta) && obj.delta.length > 1 && typeof obj.delta[0] === 'number' && typeof obj.delta[1] === 'number') {
      info.sort.value1 = obj.delta[0];
      info.sort.value2 = obj.delta[1];
      parts.push(`${obj.delta[0]}-${obj.delta[1]}`);
    } else if (Array.isArray(obj.range) && obj.range.length > 1 && typeof obj.range[0] === 'number' && typeof obj.range[1] === 'number') {
      info.sort.value1 = obj.range[0];
      info.sort.value2 = obj.range[1] - obj.range[0];
      parts.push(`${obj.range[0]}...${obj.range[1]}`);
    } else if (typeof obj.value === 'number') {
      info.sort.value1 = obj.value;
      info.sort.value2 = 0;
      parts.push(`${obj.value}`);
    }

    // Parse the unit tag, lookup an abbreviation
    if (typeof obj.unit_tag === 'string') {
      return getTagsInfo([obj.unit_tag], hook.app).then(tagsInfo => {
        if (tagsInfo.unit_term) {
          info.unit_term = tagsInfo.unit_term;

          // Append the unit abbreviation if present
          if (tagsInfo.unit_term.abbreviation) parts.push(tagsInfo.unit_term.abbreviation);
        }

        info.text = parts.join(' ');

        return hook;
      });
    }

    info.text = parts.join(' ');
  };
}

exports.computeAttributesInfo = computeAttributesInfo; // For testing

/**
 * Populate information about this datastream's tags.
 */
function computeTagsInfo() {
  return hook => {
    delete hook.data.tags_info;

    const data = hook.data;
    const tags = data.tags;
    if (!Array.isArray(tags)) return;

    return getTagsInfo(tags, hook.app).then(tagsInfo => {
      data.tags_info = tagsInfo;

      return hook;
    });
  };
}

exports.computeTagsInfo = computeTagsInfo; // For testing

/**
 * Populate hashes for uniquing and indexing this document.
 *
 * Requires a populated tags_info.
 */
function computeHashes() {
  return hook => {
    delete hook.data.hashes;

    const data = hook.data;
    const hashes = data.hashes = [];

    // Features and data used to generate hashes
    const srcFeat = [data.source ? data.source : '', data.station_id ? data.station_id : ''];
    const srcData = srcFeat.join('\r\n');
    const attData = typeof data.attributes === 'object' ? JSON.stringify(data.attributes) : '';
    const geoData = typeof data.geo === 'object' ? JSON.stringify(data.geo) : '';

    let entScheme;
    let entTagData;

    /*
      Compute a hash for the source, attributes and geo location.
     */
    let step = asyncHashDigest(srcData).then(str => {
      hashes.push({
        key: 'src',
        str: str
      });
    }).then(() => {
      return asyncHashDigest(attData);
    }).then(str => {
      hashes.push({
        key: 'att',
        str: str
      });
    }).then(() => {
      return asyncHashDigest(geoData);
    }).then(str => {
      hashes.push({
        key: 'geo',
        str: str
      });
    });

    const tagsInfo = data.tags_info;

    if (typeof tagsInfo === 'object') {
      const resolvedTerms = tagsInfo.resolved_terms;
      const schemeRefs = tagsInfo.scheme_refs;

      if (Array.isArray(resolvedTerms) && Array.isArray(schemeRefs)) {
        /*
          Determine the vocabulary scheme to use when computing the entitiy hash.
           Do this by finding the highest priority scheme referenced in classifier tags (exluding unit tags).
         */
        entScheme = resolvedTerms.reduce((s, t) => {
          if (t.vocabulary_type === 'class' && (!s._id || t.scheme_priority < s.priority)) {
            s._id = t.scheme_id;
            s.priority = t.scheme_priority;
          }
          return s;
        }, {
          priority: 999 // Reasonable upper limit
        }

        /*
          Iterate over scheme_refs; set up a promise chain to compute a hash for each scheme's tags.
         */
        );schemeRefs.forEach(ref => {
          step = step.then(() => {
            // While we're processing this scheme, see if we need to obtain tags for the entity hash
            if (typeof entTagData !== 'string' && ref._id === entScheme._id) {
              entTagData = resolvedTerms.filter(t => t.scheme_id === ref._id && t.vocabulary_type === 'class').map(t => `${t.scheme_id}_${t.vocabulary_label}_${t.label}`).sort().join('\r\n');
            }

            const tagData = resolvedTerms.filter(t => t.scheme_id === ref._id).map(t => `${t.scheme_id}_${t.vocabulary_label}_${t.label}`).sort().join('\r\n');

            return asyncHashDigest(tagData);
          }).then(str => {
            hashes.push({
              key: 'tag',
              str: str,
              scheme_id: ref._id
            });
          });
        });
      }

      /*
        Compute a hash for the entity.
         The entity hash is used to identify 'similar' datastreams that are expressed in different units.
       */
      step = step.then(() => {
        if (typeof entTagData === 'string') {
          const entFeat = [srcData, data.thing_id ? data.thing_id : '', attData, geoData, entTagData];
          const entData = entFeat.join('\r\n');

          return asyncHashDigest(entData);
        }
      }).then(str => {
        if (str) {
          hashes.push({
            key: 'ent',
            str: str,
            scheme_id: entScheme._id
          });
        }
      });
    }

    return step.then(() => hook);
  };
}

exports.computeHashes = computeHashes; // For testing

exports.before = {
  // all: [],

  find: globalHooks.coerceQuery(),

  // get: [],

  create: [commonHooks.discard('_computed', '_elapsed', '_include'), globalHooks.validate(SCHEMA_NAME), globalHooks.timestamp(), globalHooks.coerce(), globalHooks.uniqueArray('data.tags'), computeAttributesInfo(), computeTagsInfo(), computeHashes()],

  update: [commonHooks.discard('_computed', '_elapsed', '_include'), globalHooks.validate(SCHEMA_NAME), globalHooks.timestamp(), globalHooks.coerce(), globalHooks.uniqueArray('data.tags'), computeAttributesInfo(), computeTagsInfo(), computeHashes(), hook => {
    // TODO: Optimize with find/$select to return fewer fields?
    return hook.app.service('/datastreams').get(hook.id).then(doc => {
      hook.data.created_at = doc.created_at;
      return hook;
    });
  }],

  patch: commonHooks.disallow('rest'

  // remove: []
  ) };

const uomSchema = {
  include: {
    service: 'uoms',
    nameAs: 'uom',
    parentField: 'tags_info.unit_tag',
    childField: 'unit_tags'
  }
};

const convertibleToUomsSchema = {
  include: {
    service: 'uoms',
    nameAs: 'convertible_to_uoms',
    parentField: 'uom.convertible_to_uom_ids',
    childField: '_id',
    asArray: true
  }
};

const preferredUomsSchema = {
  include: {
    service: 'uoms',
    nameAs: 'preferred_uoms',
    parentField: 'preferred_uom_ids',
    childField: '_id',
    asArray: true
  }
};

exports.after = {
  all: [commonHooks.populate({ schema: uomSchema }), commonHooks.populate({ schema: convertibleToUomsSchema }), commonHooks.populate({ schema: preferredUomsSchema })]

  // find: [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
};