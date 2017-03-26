const path = require('path')

module.exports = (sequelize) => {
  const modelNames = [
    'datavalues2',
    'datavalues_borr',
    'datavalues_day',
    'datavalues_month',
    'datavalues_motes',
    'datavalues_sagehen',
    'datavalues_seasonal',
    'datavalues_ucnrs'
  ]

  let models = {}
  modelNames.forEach(name => {
    models[name] = sequelize.import(path.join(__dirname, name.toLowerCase()))
  })

  return models
}
