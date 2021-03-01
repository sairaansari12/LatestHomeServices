/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('staffWallet', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
    amount: {
        type: DataTypes.STRING(256),
        allowNull: false,
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

    empId: {
      type: DataTypes.STRING(100),
      allowNull: false
    },


    orderId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue:""
    },


    payType: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 1
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
    tableName: 'staffWallet',
    timestamps: false
  });
};
