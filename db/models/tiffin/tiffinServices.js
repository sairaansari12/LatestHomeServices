/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tiffinServices', {
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


    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },

    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      get() {
        if(this.getDataValue('tags')!="")
        return JSON.parse(this.getDataValue('tags'))
        else return []

    }
    },


    availability: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      get() {
        if(this.getDataValue('availability')!="")
        return JSON.parse(this.getDataValue('availability'))
        else return []

    }
    },


    packages: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      get() {
        if(this.getDataValue('packages')!="")
        return JSON.parse(this.getDataValue('packages'))
        else return []

    }
    },

    deliveryTimings: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      get() {
        if(this.getDataValue('deliveryTimings')!="")
        return JSON.parse(this.getDataValue('deliveryTimings'))
        else return []

    }
    },

    icon: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('icon')!="")
        return config.IMAGE_APPEND_URL+"services/icons/"+this.getDataValue('icon')
        else return ""

    },
      defaultValue: ""
    },

    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('thumbnail')!="")
        return config.IMAGE_APPEND_URL+"services/thumbnails/"+this.getDataValue('thumbnail')
        else return ""
    },
    
      defaultValue: ""
    },


    itemType: {
      type: DataTypes.STRING(20),
      defaultValue: '0'
    },

    area:
    {
      type: DataTypes.STRING(20),
      defaultValue: 50
    
    },

    contactInfo:
    {
      type: DataTypes.TEXT(),
      defaultValue: ''
    
    },
 
    status: {
      type: DataTypes.INTEGER(11),
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
    
    popularity:
    {
      type: DataTypes.STRING(100),
      defaultValue: 0,
    
    },
    

    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    
    }
  }, {
    tableName: 'tiffinServices',
    timestamps: false
  });
};
