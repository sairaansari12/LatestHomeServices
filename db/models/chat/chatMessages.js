/* jshint indent: 2 */
const common = require('../../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chatMessages', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    senderId: {
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
    type: {
        type: DataTypes.INTEGER(5),
        allowNull: false,  /////// 1=text,2=image,3=video,4=audio,5=contact,6=location
    },
    actualMessageId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: 0
    },
    messageType: {
      type: DataTypes.INTEGER(5),
      allowNull: false,    /////// 0= nothing,1= replied,2= forwarded, 3= starred
      defaultValue: 0
    },
    status: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        defaultValue: 1    /////// 1=sent,2=delivered,3=read
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
    tableName: 'chatMessages',
    timestamps: false
  });
};
