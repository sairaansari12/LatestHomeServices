
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recipeComment', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    
    recipeId: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
       

    comment: {
      type: DataTypes.TEXT(),
      allowNull: true
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

  
    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

    updatedAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'recipeComment',
    timestamps: false
  });
};
