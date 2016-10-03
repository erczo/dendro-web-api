'use strict';

const path = require('path');

module.exports = sequelize => {
  let models = {};
  const modelNames = ['County', 'Datastream', 'LoggerType', 'Measurement', 'Method', 'Place', 'Site', 'State', 'Station'];

  modelNames.forEach(model => {
    models[model] = sequelize.import(path.join(__dirname, model.toLowerCase()));
  });

  models.Datastream.belongsTo(models.County);
  models.Datastream.belongsTo(models.LoggerType);
  models.Datastream.belongsTo(models.Measurement);
  models.Datastream.belongsTo(models.Method);
  models.Datastream.belongsTo(models.Place);
  models.Datastream.belongsTo(models.Site);
  models.Datastream.belongsTo(models.State);
  models.Datastream.belongsTo(models.Station);

  return models;
};