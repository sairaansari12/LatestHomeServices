/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('orders', {
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
        return "ORDER00"+this.getDataValue('orderNo')
         } 
        
        },

  
     serviceDateTime: {
        type: DataTypes.DATE(),
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

usedLPoints :
{
  type: DataTypes.STRING(15),
        allowNull: false,
        default :'0'
},

LPointsPrice :
{
  type: DataTypes.STRING(15),
        allowNull: false,
        default :'0'
},

deliveryType :
{
  type: DataTypes.STRING(15),
  allowNull: false,
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


     userShow: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
   },
     //0->Not Started , 1-> Started from location , 2->Reached Destination  3->Job Started ,4->Job Completed
     trackStatus: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
     },

     

trackingLatitude:

{
    type: DataTypes.TEXT(),
    allowNull: true,

},

trackingLongitude:

{
    type: DataTypes.TEXT(),
    allowNull: true,

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



pickupInstructions :
{
  type: DataTypes.TEXT(),
  defaultValue :''
},

cookingInstructions :
{
  type: DataTypes.TEXT(),
  defaultValue :''
},



cookingInstMedia: {
  type: DataTypes.TEXT,
  allowNull: false,
  get() {
    if(this.getDataValue('cookingInstMedia') && this.getDataValue('cookingInstMedia')!="")
    return config.IMAGE_APPEND_URL+"cooking/"+this.getDataValue('cookingInstMedia')
    else return ""

},
  defaultValue: ""
},


tip :
{
  type: DataTypes.STRING(10),
  defaultValue :'0'
},



paymentType :
{
  type: DataTypes.STRING(10),
  defaultValue :'1'
},
refundType :
{
  type: DataTypes.INTEGER(10),
  defaultValue :0
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
    tableName: 'orders',
    timestamps: true
  });
};
