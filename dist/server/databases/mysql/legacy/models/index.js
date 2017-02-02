'use strict';

const path = require('path');

module.exports = sequelize => {
  const modelNames = ['datavalues2', 'datavalues_borr', 'datavalues_motes', 'datavalues_sagehen', 'datavalues_seasonal', 'datavalues_ucnrs'];

  let models = {};
  modelNames.forEach(name => {
    models[name] = sequelize.import(path.join(__dirname, name.toLowerCase()));
  });

  return models;
};