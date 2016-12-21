'use strict';

module.exports = (sequelize, DataTypes) => {
  return require('./define')(sequelize, DataTypes, 'datavalues_ucnrs', 'datavalues_UCNRS');
};