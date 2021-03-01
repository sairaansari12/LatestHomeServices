/* jshint indent: 2 */
const common = require('../../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('messagesStatus', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chatMessages',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE',
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
  },
    deliveredAt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
    readAt: {
        type: DataTypes.INTEGER(11),
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
    tableName: 'messagesStatus',
    timestamps: false
  });
};
