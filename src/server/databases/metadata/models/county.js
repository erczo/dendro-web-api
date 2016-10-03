module.exports = (sequelize, DataTypes) => {
  const County = sequelize.define('county', {
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

  return County
}
