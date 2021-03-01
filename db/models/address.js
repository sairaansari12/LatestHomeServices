/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('address', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    addressName: {
      type: DataTypes.STRING(500),
      defaultValue: '',
      allowNull: true

    },



    addressType: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true,
    },

   

    houseNo: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true,
    },

    latitude: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true,

    },

    longitude: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true,

    },

    town: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue :''
    },

    landmark: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue :''
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue :''
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

    default: {
      type: DataTypes.INTEGER(10),
      defaultValue: 0
    }, 

	  status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 1
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
    tableName: 'address',
    timestamps: false
  });
};
