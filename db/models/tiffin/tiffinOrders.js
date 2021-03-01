/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tiffinOrders', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    orderNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      unique:true,
       get() {
        return "TIFFODR00"+this.getDataValue('orderNo')
         } 
        
        },

  
        quantity: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue:1,
            
          },


     fromDate: {
        type: DataTypes.DATE(),
        allowNull: false,
        
      },

      endDate: {
        type: DataTypes.DATE(),
        allowNull: false,
        
      },

      tiffinId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        
      },

    package :
{ 
  type: DataTypes.STRING(200),
        allowNull: false,
},

    
orderPrice :
{ 
  type: DataTypes.STRING(15),
        allowNull: false,
},


  
promoCode :
{
  type: DataTypes.STRING(50),
        allowNull: true,
},


offerPrice :
{
  type: DataTypes.STRING(50),
        allowNull: true,
        default :'0'
},

serviceCharges :
{
  type: DataTypes.STRING(15),
        allowNull: false,
        default :'0'
},


excDays :
{
  type: DataTypes.TEXT(),
        allowNull: false,
        default :''
},

excAvailability :
{
  type: DataTypes.TEXT(),
        allowNull: false,
        default :''
},


excPrice :
{
  type: DataTypes.STRING(15),
        allowNull: false,
        default :'0'
},


totalOrderPrice :
{
  type: DataTypes.STRING(15),
   allowNull: false
},


  addressId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'address',
          key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE',
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

         //0-Pending/Not Confirmed, 1-> Confirmed , 2->Cancelled , 3->Processing,4//cancelled by company, 5->Completed
    progressStatus: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
     },


cancellationReason:

{
    type: DataTypes.TEXT(),
    allowNull: true,
    defaultValue :''

},


deliveryInstructions :
{
  type: DataTypes.TEXT(),
  defaultValue :''
},

cookingInstructions :
{
  type: DataTypes.TEXT(),
  defaultValue :''
},


tip :
{
  type: DataTypes.STRING(10),
  defaultValue :'0'
},


    createdAt: {
      type:  DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

    updatedAt: {
      type:  DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

    
  }, {
    tableName: 'tiffinOrders',
  });
};
