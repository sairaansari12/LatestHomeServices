/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('paymentSetup', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    acHolderName:{
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    accountNo:{
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },

    branchIFSC:{
      type: DataTypes.STRING(20),
      allowNull: true,
        defaultValue: ''
    },
    //0->Full Amount, 1-> Charges Percentage
    branchName: {
      type: DataTypes.TEXT,
      allowNull: true,
        defaultValue: ''
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
      defaultValue: new Date()
    },
  },
   {
    tableName: 'paymentSetup',
    timestamps: false
  });
};
