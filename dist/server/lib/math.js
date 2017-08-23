'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('mathjs/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const math = _core2.default.create(); /**
                                       * Math.js exported with custom bundling.
                                       * SEE: https://github.com/josdejong/mathjs/blob/2b95c65a30a84cdd0d48a3994e194ea339ef9c87/docs/custom_bundling.md
                                       *
                                       * @author J. Scott Smith
                                       * @license BSD-2-Clause-FreeBSD
                                       * @module lib/utils
                                       */

math.import(require('mathjs/lib/type/complex'));
math.import(require('mathjs/lib/type/unit'));
math.import(require('mathjs/lib/function/unit'));
math.import(require('mathjs/lib/function/arithmetic/round'));

// HACK: Prefixes are not turned on for 'bar'; oh freakin' why not - improvise with a custom unit
// NOTE: The createUnit API into math.js is weird and confusing: http://mathjs.org/docs/datatypes/units.html
math.createUnit('mbar', '0.0145038 psi');

exports.default = math;