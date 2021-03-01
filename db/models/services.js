/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('services', {
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


  productType: {
    type: DataTypes.INTEGER(10),
    defaultValue: 1
  },

  addOnIds: {
    type: DataTypes.TEXT(),
    allowNull: true,
      get() {
        if(this.getDataValue('addOnIds') && this.getDataValue('addOnIds')!="") 
        return JSON.parse(this.getDataValue('addOnIds'))
        else return [];
    },
  },

  
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },

    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
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




    type: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ""
    },

    duration: {
      type: DataTypes.STRING(50),
      allowNull: true,
      get() {
        if(this.getDataValue('duration') && this.getDataValue('duration')!="") 
        {
        var data=this.getDataValue('duration').toString().toLowerCase()
        data=data.replace("mins","")
        data=data.replace("min","")
        data=data.replace(".","")
        data=data.replace("minutes","")
        return data.trim() +" Mins."
        }
        else return "Not specified";
    },


      defaultValue: ""
    },




    
    originalPrice: {
      type: DataTypes.FLOAT(20),
      allowNull: false,
      defaultValue: 0
    },

    
    offer: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: 0
    },


    
    offerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },

    
    validUpto: {
      type: DataTypes.DATE(),
      allowNull: true,
    },
    

    price:
    {
      type: DataTypes.FLOAT(10),
      allowNull: false,
      defaultValue: 0
    },

    includedServices: {
      type: DataTypes.STRING(),
    //   get() {
    //     return this.getDataValue('includedServices').split(',')
    // },
    
      allowNull: true,
      defaultValue:''
    },


    excludedServices: {
      type: DataTypes.STRING(),
    //   get() {
    //     return this.getDataValue('excludedServices').split(',')
    // },
    
      allowNull: true,
      defaultValue:''
    },


    itemType: {
      type: DataTypes.STRING(20),
      defaultValue: '0'
    },


    

    orderby: {
      type: DataTypes.INTEGER(20),
      allowNull: true
    },


    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
    },
    


    approve: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },


    deleted: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
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


    parentCompany: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '0'

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
      type: DataTypes.STRING(20),
      defaultValue: 0,
    
    },

    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    
    }
  }, {
    tableName: 'services',
    timestamps: false
  });
};
