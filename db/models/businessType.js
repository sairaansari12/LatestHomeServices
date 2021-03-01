
/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('businessType', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

  
businessName :
{
  type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue:""
},

type :
{
  type: DataTypes.INTEGER(5),
        allowNull: false,
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
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: new Date()
    },

    updatedAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue:  new Date()
    }
  }, {
    tableName: 'businessType',
    timestamps: false
  });
};
