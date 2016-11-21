'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function () {
  return function () {
    const app = this;
    const schemaNames = fs.readdirSync(path.join(__dirname, '../../../schema'));

    app.set('schemaNames', schemaNames);
  };
}();