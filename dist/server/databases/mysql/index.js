'use strict';

module.exports = function () {
  return function () {
    const app = this;
    const mysql = app.get('databases').mysql;

    if (mysql.legacy) app.configure(require('./legacy'));
  };
}();