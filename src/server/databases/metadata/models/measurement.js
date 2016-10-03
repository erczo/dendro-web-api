module.exports = (sequelize, DataTypes) => {
  const Measurement = sequelize.define('measurement', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    }
  }, {})

  return Measurement
}
