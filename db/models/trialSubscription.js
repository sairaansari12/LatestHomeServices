const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trialSubscription', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
    },

  
    durationId: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },

    duration: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },

      amount: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
  
    startDate: {
      type: DataTypes.DATEONLY(),
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATEONLY(),
      allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: new Date()
      },
    }, {
      tableName: 'trialSubscription',
      timestamps: false
    });
  };
  
