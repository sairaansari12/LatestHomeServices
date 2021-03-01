
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tiffinPayment', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    
  
transactionId: {
  type: DataTypes.TEXT,
  allowNull: true,
   
},


paymentMode: {
  type: DataTypes.TEXT,
  allowNull: true
   
},

//0-Not recieved //1 Super Admin, 2//Transferred to vendor
paymentState: {
  type: DataTypes.INTEGER(10),
  allowNull: false,
  defaultValue:0
   
},
orderId: {
  type: DataTypes.STRING(255),
  allowNull: false
  
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


//1 -Success , 2//Failed 
transactionStatus: {
  type: DataTypes.INTEGER(5),
  allowNull: false,
    defaultValue: 2
},
amount: {
  type: DataTypes.STRING(10),
  allowNull: false,
    defaultValue: "0"
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
    tableName: 'tiffinPayment',
    timestamps: false
  });
};
