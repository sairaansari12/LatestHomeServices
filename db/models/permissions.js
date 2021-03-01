/* jshint indent: 2 */
const common = require('../../helpers/common');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('permissions', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    productReviewDelete:{
      type: DataTypes.STRING(10),
      allowNull: true,
        defaultValue: '0'
    },

    staffReviewDelete:{
      type: DataTypes.STRING(10),
      allowNull: true,
        defaultValue: '0'
    },
    //0->Full Amount, 1-> Charges Percentage
    restroReviewDelete:{
      type: DataTypes.STRING(10),
      allowNull: true,
        defaultValue: '0'
    },
    pApproved:{
      type: DataTypes.STRING(10),
      allowNull: true,
        defaultValue: '0'
    },
    
    pCategories:{
      type: DataTypes.TEXT,
      allowNull: true,
        defaultValue: '',
        get() {
          if(this.getDataValue('pCategories') && this.getDataValue('pCategories')!="") 
          return JSON.parse(this.getDataValue('pCategories'))
          else return [];
      },
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
    tableName: 'permissions',
    timestamps: false
  });
};
