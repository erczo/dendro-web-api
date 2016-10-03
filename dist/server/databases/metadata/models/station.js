'use strict';

module.exports = (sequelize, DataTypes) => {
  const Station = sequelize.define('station', {
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});

  return Station;
};