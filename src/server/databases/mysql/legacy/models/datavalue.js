module.exports = (sequelize, DataTypes) => {
  const Datavalue = sequelize.define('datavalue', {
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
      utc_date_time: function () { return new Date(this.local_date_time.getTime() - this.utc_offset * 3600000) }
    },
    tableName: 'datavalues2'
  })

  return Datavalue
}
