/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('faq', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    
  
question: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},

faqCategory: {
  type: DataTypes.STRING(100),
  allowNull: true,
   defaultValue:''
},


answer: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},


language: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},


status: {
  type: DataTypes.INTEGER(5),
  allowNull: false,
    defaultValue: 1
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
  }, {
    tableName: 'faq',
    timestamps: false
  });
};
