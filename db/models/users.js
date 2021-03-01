/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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

    firstName: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true

    },


    lastName: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true,

    },

    email: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true,

    },

    phoneNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },


    countryCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    
    password: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      allowNull: false,

    },


    address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    
    image: {
      type: DataTypes.STRING(100),
      allowNull: true,
      get() {
        if( this.getDataValue('image')!=null && this.getDataValue('image')!="")
        return config.IMAGE_APPEND_URL+"users/"+this.getDataValue('image')
        else  return ""

    },
      defaultValue: ''
    },

    dob: {
      type: DataTypes.DATEONLY(),
      allowNull: true
    },

    maritalStatus: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    anniversaryDate: {
      type:  DataTypes.DATEONLY(),
      allowNull: true
    },



	deviceToken:{
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },

	userType:{
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: 1
    },

    referralCode: {
      type: DataTypes.STRING(),
      allowNull: false,
      defaultValue:''
    
        },

	sessionToken:{
      type: DataTypes.STRING(1000),
      allowNull: false,
      defaultValue: ''
    },
	moduleType:{
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
	platform:{
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },

    lPoints:{
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '0'
  },

	status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 1
      },
      detailsFilled: {
        type: DataTypes.INTEGER(11),
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
    tableName: 'users',
    timestamps: false
  });
};
