'use strict';

module.exports = (sequelize, DataTypes) => {
  const LoggerType = sequelize.define('logger_type', {
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

  return LoggerType;
};