/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('plans', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    validity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
    },
    banner: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
createdAt: {
  type:  DataTypes.DATE(),
  allowNull: false,
  defaultValue: new Date()
}
  }, {
    tableName: 'plans',
    timestamps: false
  });
};
