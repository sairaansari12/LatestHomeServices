const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userSubscription', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subscription',
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
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
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: common.timestamp()
      },
    }, {
      tableName: 'userSubscription',
      timestamps: false
    });
  };
  
