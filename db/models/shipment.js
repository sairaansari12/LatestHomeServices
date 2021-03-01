/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('shipment', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    
  
    freeUptoDistance: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue:""
       
    },
    
    extraDistanceCharges: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue:0
       
    },


    radius: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue:''
       
    },

companyId: {
  type: DataTypes.UUID,
  allowNull: false,
  references: {
    model: 'companies',
    key: 'id'
   },
   onUpdate: 'CASCADE',
   onDelete: 'CASCADE',
},

createdAt: {
  type:  DataTypes.DATE(),
  allowNull: false,
  defaultValue: new Date()
},

updatedAt: {
  type:  DataTypes.DATE(),
  allowNull: false,
  defaultValue: new Date(),
    onUpdate: new Date(),


},
  }, {
    tableName: 'shipment',
    timestamps: false
  });
};
