const path = require('path')

module.exports = (sequelize) => {
  let models = {}
  const modelNames = [
    'Datavalue'
  ]

  modelNames.forEach(name => {
    models[name] = sequelize.import(path.join(__dirname, name.toLowerCase()))
  })

  return models
}
