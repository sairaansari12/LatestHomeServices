/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('document', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    
   

aboutus: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},

aboutusLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},

privacyContent: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},


privacyLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},


termsContent: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},


termsLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},


cancellationPolicy: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},


cancellationCharges: {
  type: DataTypes.FLOAT(10),
  allowNull: true,
    defaultValue: '0'
},

cancellationLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},


websiteLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},



facebookLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},

gmailLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},


linkedinLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},

twitterLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},


instaLink: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},
currency: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: '$'
},

language: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: 'EN'
},

autoAssign: {
  type: DataTypes.TEXT,
  allowNull: true,
   defaultValue: 'yes'
},

//0->My Staff, 1-> App Staff

staffPref: {
  type: DataTypes.INTEGER(10),
  allowNull: true,
   defaultValue: 0
},





loyalityPoints: {
  type: DataTypes.STRING(20),
  defaultValue: 0
},

lpReferral1: {
  type: DataTypes.STRING(20),
  defaultValue: 0
},


lpReferral2: {
  type: DataTypes.STRING(20),
  defaultValue: 0
},


lpProMember: {
  type: DataTypes.STRING(20),
  defaultValue: 0
},


onelPValue: {
  type: DataTypes.STRING(20),
  defaultValue: 0
},

lpOrderPercentage: {
  type: DataTypes.STRING(20),
  defaultValue: 0
},

targetSales: {
  type: DataTypes.STRING(20),
  defaultValue: 500
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
    tableName: 'document',
    timestamps: false
  });
};
