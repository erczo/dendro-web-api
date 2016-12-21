'use strict';

module.exports = (sequelize, DataTypes) => {
  return require('./define')(sequelize, DataTypes, 'datavalues_borr', 'datavalues_BORR');
};