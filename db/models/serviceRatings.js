/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('serviceRatings', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

  

     rating :
     {
       type: DataTypes.STRING(15),
       allowNull: true,
        defaultValue: "0"
     },
     

     review :
     {
       type: DataTypes.TEXT(),
        allowNull: true,
        defaultValue: ""

     },

     userId: {
      type: DataTypes.STRING(100),
      defaultValue:''
    },

    orderId: {
      type: DataTypes.STRING(100),
      defaultValue:''
    },


    
    serviceId: {
      type: DataTypes.STRING(100),
      defaultValue:''
    },
   
    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

  
  }, {
    tableName: 'serviceRatings',
    timestamps: false
  });
};
