/**
 * Web API utilities and helpers.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/utils
 */

const crypto = require('crypto')

/**
 * Basic interval class; adapted from:
 * http://docs.sympy.org/latest/modules/sets.html
 */
class Interval {
  static empty () {
    return new Interval(0, 0, true, true)
  }

  constructor (start, end, leftOpen = false, rightOpen = false) {
    [this.start, this.end, this.leftOpen, this.rightOpen] = [start, end, leftOpen, rightOpen]
  }

  get empty () {
    return (this.end < this.start) || ((this.end - this.start === 0) && (this.leftOpen || this.rightOpen))
  }

  intersect (other) {
    if (!(other instanceof Interval)) return
    if ((this.start > other.end) || (this.end < other.start)) return Interval.empty()

    let start, end, leftOpen, rightOpen

    if (this.start < other.start) {
      start = other.start
      leftOpen = other.leftOpen
    } else if (this.start > other.start) {
      start = this.start
      leftOpen = this.leftOpen
    } else {
      start = this.start
      leftOpen = this.leftOpen || other.leftOpen
    }

    if (this.end < other.end) {
      end = this.end
      rightOpen = this.rightOpen
    } else if (this.end > other.end) {
      end = other.end
      rightOpen = other.rightOpen
    } else {
      end = this.end
      rightOpen = this.rightOpen || other.rightOpen
    }

    return new Interval(start, end, leftOpen, rightOpen)
  }
}

exports.Interval = Interval

/**
 * Simple, promise-based hash generator.
 */
function asyncHashDigest (data, algorithm = 'sha1', encoding = 'hex') {
  return new Promise((resolve) => {
    setImmediate(() => {
      resolve(crypto.createHash(algorithm).update(data).digest(encoding))
    })
  })
}

exports.asyncHashDigest = asyncHashDigest

/**
 * Works like Array.map, expect for objects.
 */
function treeMap (obj, callback, path = '') {
  if (Array.isArray(obj)) return obj.map((el, i) => { return treeMap(el, callback, `${path}/${i}`) })

  // We only want to map leaf properties of data objects
  if (obj.toString() === '[object Object]') {
    obj = Object.assign({}, obj)
    Object.keys(obj).forEach(key => {
      obj[key] = treeMap(obj[key], callback, `${path}/${key}`)
    })
    return obj
  }
  return callback(obj, path)
}

exports.treeMap = treeMap
