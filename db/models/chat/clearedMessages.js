/* jshint indent: 2 */
const common = require('../../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('clearedMessages', {
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
    groupId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'groups',
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
    tableName: 'clearedMessages',
    timestamps: false
  });
};
