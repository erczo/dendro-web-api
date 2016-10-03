module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define('site', {
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

  return Site
}
