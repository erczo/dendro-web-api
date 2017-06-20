const chai = require('chai')
const fs = require('fs')
const path = require('path')

global.assert = chai.assert
global.expect = chai.expect
global.helper = {
  loadJSON: (filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        return err ? reject(err) : resolve(data)
      })
    }).then(data => {
      return JSON.parse(data)
    })
  }
}
global.main = require('../../../dist/server/main.js')
global.path = path
