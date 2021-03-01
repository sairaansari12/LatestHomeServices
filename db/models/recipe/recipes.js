/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recipes', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: 0
      
  },

    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: ''

    },

    description: {
      type: DataTypes.TEXT(),
      allowNull: false,
      defaultValue: ""
    },

    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
   
    },

    media: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      get() {
        if(this.getDataValue('media')!="")
        return this.getDataValue('media').split(",")
        else return ""

    }
    },

    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
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

    latitude:
    {
      type: DataTypes.STRING(20),
      defaultValue: 0
    
    },
    

    longitude:
    {
      type: DataTypes.STRING(20),
      defaultValue: 0
    
    },
    
    totalRatings:
    {
      type: DataTypes.STRING(20),
      defaultValue: 0
    
    },
    
    rating:
    {
      type: DataTypes.STRING(20),
      defaultValue: 0,
    
    },
    
    views:
    {
      type: DataTypes.STRING(40),
      defaultValue: 0,
    
    },
    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    
    }
  }, {
    tableName: 'recipes',
    timestamps: false
  });
};
