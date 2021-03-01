/* jshint indent: 2 */
const common = require('../../helpers/common');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comissionHistory', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    amount:{
      type: DataTypes.FLOAT(10),
      allowNull: true,
        defaultValue: 0
    },
      //0->Monthly, 1-> Quarterly , 2->Yearly
    paidType: {
      type: DataTypes.STRING(10),
      allowNull: true,
        defaultValue: ''
    },
    charges: {
        type: DataTypes.FLOAT(20),
        allowNull: true,
        defaultValue:0
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
    tableName: 'comissionHistory',
    timestamps: false
  });
};
