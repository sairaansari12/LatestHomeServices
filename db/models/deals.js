/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('deals', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    
    dealName: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true
    },
    dealText: {
      type: DataTypes.STRING(255),
      defaultValue: '',
      allowNull: true
    },


    

    code: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true,
    },
    discount: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true, 
    },
    description: {
      type: DataTypes.TEXT(),
      defaultValue: '',
      allowNull: true, 
    },

    type: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: true, 
    },

    usageLimit: {
      type: DataTypes.INTEGER(5),
      defaultValue: 1,
      allowNull: true, 
    },



    icon: {
      type: DataTypes.TEXT,
      get() {
        if(this.getDataValue('icon')!=null && this.getDataValue('icon')!="")
        return config.IMAGE_APPEND_URL+"coupans/icons/"+this.getDataValue('icon')
    },
      defaultValue: "",
      allowNull: true, 
    },



    thumbnail: {
      type: DataTypes.TEXT,
      get() {
        if( this.getDataValue('thumbnail')!=null && this.getDataValue('thumbnail')!="")
        return config.IMAGE_APPEND_URL+"coupans/thumbnails/"+this.getDataValue('thumbnail')
    },
      defaultValue: "",
      allowNull: true, 
    },


    companyId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue:''
    },

    validUpto: {
      type: DataTypes.DATE(),
      allowNull: true,
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
    tableName: 'deals',
    timestamps: false
  });
};
