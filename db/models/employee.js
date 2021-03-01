/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('employees', {
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


    role: {
      type: DataTypes.INTEGER(5),
      defaultValue: '0',
      allowNull: true

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


    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,

    },


    address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    
    image: {
      type: DataTypes.TEXT(),
      allowNull: true,
      get() {
        if( this.getDataValue('image')!=null && this.getDataValue('image')!="")
        return config.IMAGE_APPEND_URL+"employees/images/"+this.getDataValue('image')
        else  return ""
    },
      defaultValue: ''
    },


    coverImage: {
      type: DataTypes.TEXT(),
      allowNull: true,
      get() {
        if( this.getDataValue('coverImage')!=null && this.getDataValue('coverImage')!="")
        return config.IMAGE_APPEND_URL+"employees/images/"+this.getDataValue('coverImage')
        else  return ""
    },
      defaultValue: ''
    },

    idProof: {
      type: DataTypes.TEXT(),
      allowNull: true,
      defaultValue: '',
      get() {
        if( this.getDataValue('idProof')!=null && this.getDataValue('idProof')!="")
        return config.IMAGE_APPEND_URL+"employees/proofs/"+this.getDataValue('idProof')
        else  return ""
    },
    },


    idProofName: {
      type: DataTypes.STRING(256),
      allowNull: true,
      defaultValue:""
  },
	deviceToken:{
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },

	sessionToken:{
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: ''
    },
loginstatus: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
    },
	platform:{
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },

    assignedServices: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        return this.getDataValue('assignedServices').split(',')
    },
      defaultValue: ""
    },


    currentLat:{
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ''
    },

    currentLong:{
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ''
    },


	status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 1
      },

      loginstatus: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 1
      },


      rating: {
        type: DataTypes.STRING(11),
        allowNull: false,
        defaultValue: '0'
      },

      totalRatings: {
        type: DataTypes.STRING(11),
        allowNull: false,
        defaultValue: '0'
      },


      totalOrders: {
        type: DataTypes.STRING(11),
        allowNull: false,
        defaultValue: '0'
      },


      walletBalance: {
        type: DataTypes.FLOAT(10),
        allowNull: false,
        defaultValue: 0
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
    tableName: 'employees',
    timestamps: false
  });
};
