/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('filters', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },


    filter:
    {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: ""
    },



    
    cid:
    {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: ""
    },

    
    categoryId: {
      type: DataTypes.STRING(200),
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
  
      
    status: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: 1
    },
    
    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'filters',
    timestamps: false
  });
};
