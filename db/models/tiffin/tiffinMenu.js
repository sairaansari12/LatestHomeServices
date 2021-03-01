/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tiffinMenu', {
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
    
    dayName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },


    bMeal: {
      type: DataTypes.TEXT(),
      allowNull: true,
      defaultValue: ''

    },
    bPrice: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '0'

    },

    lMeal: {
      type: DataTypes.TEXT(),
      allowNull: true,
      defaultValue: ''

    },
    lPrice: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '0'

    },

    dMeal: {
      type: DataTypes.TEXT(),
      allowNull: true,
      defaultValue: ''

    },
    dPrice: {
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
    tableName: 'tiffinMenu',
    timestamps: false
  });
};
