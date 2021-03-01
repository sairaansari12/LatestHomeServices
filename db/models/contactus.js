/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contactus', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
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

    query: {
      type: DataTypes.TEXT(),
      allowNull: false,
  }, 
  
  
  userId: {
    type: DataTypes.STRING(100),
    allowNull: false,
}, 


email: {
  type: DataTypes.STRING(256),
  allowNull: false,
  defaultValue:''
},


  
    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },

    readStatus: {
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
    tableName: 'contactus',
    timestamps: false
  });
};
