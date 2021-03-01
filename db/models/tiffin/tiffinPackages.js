/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tiffinPackages', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

  

    tiffinId: {
      type: DataTypes.STRING(255),
      allowNull: false
    },


    companyId: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    
    packageName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },


    price: {
      type: DataTypes.TEXT(),
      allowNull: true,
      defaultValue: ''

    },
    oneTimePrice: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '0'

    },


    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    
    }
  }, {
    tableName: 'tiffinPackages',
    timestamps: false
  });
};
