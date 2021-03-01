/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cancelReasons', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reason: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },

  
    status: {
      type: DataTypes.INTEGER(11),
      defaultValue: 1,
      allowNull: true

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
    createdAt: {
      type:  DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },
  }, {
    tableName: 'cancelReasons',
    timestamps: false
  });
};
