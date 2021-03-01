/* jshint indent: 2 */
const common = require('../../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mediaMessages', {
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
    media: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    thumbnail: {
        type: DataTypes.STRING(200),
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
    tableName: 'mediaMessages',
    timestamps: false
  });
};
