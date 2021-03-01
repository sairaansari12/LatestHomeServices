/* jshint indent: 2 */
const common = require('../../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('groups', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE',
    },
    createdByAdmin: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
  },
	  groupName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue:''
    },
	  groupIcon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue:''

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
    tableName: 'groups',
    timestamps: false
  });
};
