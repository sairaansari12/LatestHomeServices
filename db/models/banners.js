/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('banners', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(600),
      defaultValue: '',
      allowNull: true

    },

    url: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      get() {
        return config.IMAGE_APPEND_URL+"banners/"+this.getDataValue('url')
    },
      allowNull: true

    },
    status: {
      type: DataTypes.INTEGER(11),
      defaultValue: 1,
      allowNull: true

    },
    orderby: {
      type: DataTypes.INTEGER(30),
      allowNull: false
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
    tableName: 'banners',
    timestamps: false
  });
};
