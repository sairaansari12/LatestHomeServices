/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trials', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },


    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: '',
    },

    username: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: '',
    },

    password: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
    },


    password1: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
    },



    businessName: {
        type: DataTypes.STRING(256),
        allowNull: false,
    },


    //1-Single Vendor , 2-->Multi Vendor
    vendorType: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue:2
  },

    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
  },

 
phoneNumber: {
  type: DataTypes.STRING(20),
},

countryCode: {
  type: DataTypes.STRING(20),
},



status: {
  type: DataTypes.INTEGER(11),
  allowNull: false,
  defaultValue: 1
},



address: {
  type: DataTypes.TEXT,
  allowNull: true,
    defaultValue: ''
},




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
    tableName: 'trials',
    timestamps: false
  });
};
