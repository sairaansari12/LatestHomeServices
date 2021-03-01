/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notifications', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    notificationTitle: {
      type: DataTypes.STRING(200),
      allowNull: false
    },

      notificationDescription: {
      type: DataTypes.STRING(200),
      allowNull: false
    },



    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    orderId: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue:""
    },

    //1-Super Admin, 2//vendor/Company ,3- Customers
role:
{
  type: DataTypes.INTEGER(11),
  allowNull: false,
  defaultValue: 3

},

    readStatus:{
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
 
    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
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
    tableName: 'notifications',
    timestamps: true
  });
};
