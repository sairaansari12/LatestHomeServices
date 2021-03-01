/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userInformation', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },


    name: {
      type: DataTypes.STRING(256),
      allowNull: false,
      defaultValue:''
  },

    email: {
        type: DataTypes.STRING(256),
        allowNull: false,
        defaultValue:''
    },


    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue:''
  },

    purpose: {
      type: DataTypes.TEXT(),
      allowNull: false,
  }, 
  
  
  address: {
    type: DataTypes.TEXT(),
    allowNull: false,
    defaultValue:''

}, 


    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
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
    tableName: 'userInformation',
    timestamps: false
  });
};
