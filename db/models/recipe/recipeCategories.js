/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recipeCategories', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

  
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },


    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
    },
    
    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    
    }
  }, {
    tableName: 'recipeCategories',
    timestamps: false
  });
};
