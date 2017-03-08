module.exports = (sequelize, DataTypes, modelName, tableName) => {
  const Datavalue = sequelize.define(modelName, {
    id: {
      allowNull: false,
      field: 'ValueID',
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    datastream_id: {
      allowNull: false,
      field: 'DatastreamID',
      type: DataTypes.INTEGER
    },
    local_date_time: {
      field: 'LocalDateTime',
      type: DataTypes.DATE
    },
    utc_offset: {
      field: 'UTCOffset',
      type: DataTypes.INTEGER
    },
    value: {
      allowNull: false,
      field: 'DataValue',
      type: DataTypes.DOUBLE
    }
  }, {
    freezeTableName: true,
    getterMethods: {
      utc_date_time: function () { return new Date(this.local_date_time.getTime() - this.utc_offset * 3600000) },
      utc_offset_secs: function () { return this.utc_offset * 3600 }
    },
    tableName: tableName
  })

  return Datavalue
}
