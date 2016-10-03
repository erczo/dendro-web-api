module.exports = (sequelize, DataTypes) => {
  const Method = sequelize.define('method', {
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

  return Method
}
