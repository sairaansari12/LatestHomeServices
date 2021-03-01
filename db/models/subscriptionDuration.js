/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subscriptionDuration', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    subId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subscription',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
    },

    duration: {
      type:DataTypes.INTEGER(20),
      allowNull: true,
      defaultValue: 0,
      get() {
        var stringApp="Months"
        if(this.getDataValue('duration') && this.getDataValue('duration')<2) 
        stringApp="Month"
        
        return this.getDataValue('duration')+ " "+stringApp
         } 
        
    },
   
    price: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: '0'
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
    tableName: 'subscriptionDuration',
    timestamps: false
  });
};
