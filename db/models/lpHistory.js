/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('lpHistory', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
   
   
    userId: {
      type: DataTypes.STRING(100),
      allowNull: false
    },


    points: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue:""
    },


    payType: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 1
      },


      orderId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue:""
      },

    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },
    updatedAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'lpHistory',
    timestamps: false
  });
};
