module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('state', {
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

  return State
}
