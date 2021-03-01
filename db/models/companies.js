/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('companies', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },


    parentId: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: '',
    },

    companyName: {
        type: DataTypes.STRING(256),
        allowNull: false,
    },

    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
  },

  password: {
    type: DataTypes.STRING(256),
    allowNull: false,
},

phoneNumber: {
  type: DataTypes.STRING(20),
},

countryCode: {
  type: DataTypes.STRING(20),
},

//2 -Companies , 1-Super Admin
role: {
  type: DataTypes.INTEGER(10),
  default:2
},


logo1: {
  type: DataTypes.TEXT,
  allowNull: true,
      get() {
        if( this.getDataValue('logo1')!=null && this.getDataValue('logo1')!="")
        return config.IMAGE_APPEND_URL+"users/"+this.getDataValue('logo1')
    },
      defaultValue: ''
},

logo2: {
  type: DataTypes.TEXT,
  allowNull: true,
      get() {
        if( this.getDataValue('logo2')!=null && this.getDataValue('logo2')!="")
        return config.IMAGE_APPEND_URL+"users/"+this.getDataValue('logo2')
    },
      defaultValue: ''
},


logo3: {
  type: DataTypes.TEXT,
  allowNull: true,
      get() {
        if( this.getDataValue('logo3')!=null && this.getDataValue('logo3')!="")
        return config.IMAGE_APPEND_URL+"users/"+this.getDataValue('logo3')
    },
      defaultValue: ''
},



startTime: {
  type: DataTypes.STRING(200),
  allowNull: false,
  defaultValue: '',
},


endTime: {
  type: DataTypes.STRING(200),
  allowNull: false,
  defaultValue: '',
},

status: {
  type: DataTypes.INTEGER(11),
  allowNull: false,
  defaultValue: 1
},



//0->Visit Vendor , 1->Delivery ,2->Both

deliveryType:
{
  type: DataTypes.INTEGER(11),
  defaultValue: 2

},


//0->Veg, 1-->Non veg,2->both


itemType:
{
  type: DataTypes.INTEGER(11),
  defaultValue: 2

},



address1: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},

// address1LatLong: {
//   type: DataTypes.TEXT,
//   allowNull: false,
//   defaultValue: ""
// },


latitude: {
  type: DataTypes.FLOAT(10),
  allowNull: false,
  defaultValue: 0
},


longitude: {
  type: DataTypes.FLOAT(10),
  allowNull: false,
  defaultValue: 0
},


websiteLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},



totalRatings:
{
  type: DataTypes.STRING(11),
  defaultValue: 0

},

rating:
{
  type: DataTypes.STRING(11),
  defaultValue: 0,

},
foodQualityRating:
{
  type: DataTypes.STRING(11),
  defaultValue: 0,

},


foodQuantityRating:
{
  type: DataTypes.STRING(11),
  defaultValue: 0,

},

packingPresRating:
{
  type: DataTypes.STRING(11),
  defaultValue: 0,

},



totalOrders:
{
  type: DataTypes.STRING(100),
  defaultValue: 0,
  get() {
   
    return this.getDataValue('totalOrders').toString()
},
},


totalOrders24:
{
  type: DataTypes.STRING(100),
  defaultValue: 0,

},

offer:
{
  type: DataTypes.STRING(255),
  allowNull: true

},



tags: {
  type: DataTypes.TEXT(),
  allowNull: true,
    get() {
      if(this.getDataValue('tags') && this.getDataValue('tags')!="") 
      return JSON.parse(this.getDataValue('tags'))
      else return [];
  },
},



tagsIncluded: {
  type: DataTypes.TEXT(),
  allowNull: true,
    get() {
      if(this.getDataValue('tagsIncluded') && this.getDataValue('tagsIncluded')!="") 
      return JSON.parse(this.getDataValue('tagsIncluded'))
      else return [];
  },
},



deviceToken:{
  type: DataTypes.STRING(255),
  allowNull: false,
  defaultValue: ''
},

sessionToken:{
  type: DataTypes.STRING(1000),
  allowNull: false,
  defaultValue: ''
},

platform:{
  type: DataTypes.STRING(255),
  allowNull: false,
  defaultValue: ''
},




createdAt: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    },
    updatedAt: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    }
  }, {
    tableName: 'companies',
    timestamps: false
  });
};
