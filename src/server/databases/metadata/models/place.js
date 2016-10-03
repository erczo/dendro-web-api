module.exports = (sequelize, DataTypes) => {
  const Place = sequelize.define('place', {
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {})

  return Place
}
