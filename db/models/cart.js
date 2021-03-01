/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cart', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    
    serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE',
      },

      
   


    
orderPrice :
{
  type: DataTypes.STRING(15),
        allowNull: false,
},

deliveryType :
{
  type: DataTypes.STRING(15),
  allowNull: false,
},

quantity :
{
  type: DataTypes.STRING(15),
        allowNull: false,
},

orderTotalPrice :
{
  type: DataTypes.STRING(15),
   allowNull: false,
},


promoCode :
{
  type: DataTypes.STRING(60),
   allowNull: true,
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

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
    },

  
    createdAt: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    },

    updatedAt: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    }
  }, {
    tableName: 'cart',
    timestamps: false
  });
};
