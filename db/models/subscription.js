/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subscription', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
        defaultValue: ''
    },
  
    features:
    {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('features')!="") 
        return JSON.parse(this.getDataValue('features'))
        else return ""
      },
      defaultValue: ""
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
    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
    },
    createdAt: {
      type:  DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

    updatedAt: {
      type:  DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },
  }, {
    tableName: 'subscription',
    timestamps: false
  });
};
