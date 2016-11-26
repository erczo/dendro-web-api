const path = require('path')

module.exports = (sequelize) => {
  const modelNames = [
    'Datavalue'
  ]

  let models = {}
  modelNames.forEach(name => {
    models[name] = sequelize.import(path.join(__dirname, name.toLowerCase()))
  })

  return models
}
