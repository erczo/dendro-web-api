'use strict';

const Sequelize = require('sequelize');
const models = require('./models');

module.exports = function () {
  return function () {
    const app = this;

    // Configure a new instance
    const sequelize = new Sequelize(app.get('mysql'), {
      define: {
        timestamps: false,
        underscored: true
      },
      dialect: 'mysql',
      // TODO: Replace logger with winston; handle this centrally
      logging: console.log
    });

    const databases = app.get('databases');

    databases.metadata = {
      Sequelize: Sequelize,
      sequelize: sequelize,
      models: models(sequelize)
    };
  };
}();