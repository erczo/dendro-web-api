module.exports = (sequelize, DataTypes) => {
  const Datastream = sequelize.define('datastream', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    device_label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logger_label: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {})

  return Datastream
}
