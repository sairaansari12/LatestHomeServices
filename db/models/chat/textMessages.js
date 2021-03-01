/* jshint indent: 2 */
const common = require('../../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('textMessages', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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
    message: {
        type: DataTypes.STRING(256),
        allowNull: false,
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
    tableName: 'textMessages',
    timestamps: false
  });
};
