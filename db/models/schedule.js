/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('schedule', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },


    dayParts:
    {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    permanentSlots:
    {
      type: DataTypes.TEXT,
      allowNull: false,
    //   get() {
    //     return this.getDataValue('permanentSlots').split(',')
    // },
      defaultValue: ""
    },


    slots: {
      type: DataTypes.TEXT,
      allowNull: false,
    //   get() {
    //     return this.getDataValue('slots').split(',')
    // },
      defaultValue: ""
    },

  


 
    
    startTime: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },


    endTime: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },




    turnaround: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    }
  }, {
    tableName: 'schedule',
    timestamps: false
  });
};
