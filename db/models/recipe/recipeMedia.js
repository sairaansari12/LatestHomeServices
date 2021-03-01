
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recipeMedia', {
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
       

      mediaType :
      {
        type: DataTypes.STRING(100),
              allowNull: false,
            
      }, 

      mediaUrl:
      {
      type: DataTypes.STRING(255),
      allowNull: false,
      get() {
        if( this.getDataValue('mediaUrl')!=null && this.getDataValue('mediaUrl')!="")
        return config.IMAGE_APPEND_URL+"recipes/"+this.getDataValue('mediaUrl')
        else  return ""

    },
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
    tableName: 'recipeMedia',
    timestamps: false
  });
};
