/* jshint indent: 2 */
const common = require('../../helpers/common');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comission', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    chargesPercent:{
      type: DataTypes.TEXT,
      allowNull: true,
        defaultValue: ''
    },

    chargesAmount:{
      type: DataTypes.TEXT,
      allowNull: true,
        defaultValue: ''
    },
    //0->Full Amount, 1-> Charges Percentage
    chargesType: {
      type: DataTypes.TEXT,
      allowNull: true,
        defaultValue: ''
    },
    //0->Monthly, 1-> quarterly , 2->Yearly
    installments: {
        type: DataTypes.STRING(10),
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
    tableName: 'comission',
    timestamps: false
  });
};
