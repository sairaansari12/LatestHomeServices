/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tiffinAssignedEmp', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

  

     rating :
     {
       type: DataTypes.STRING(15),
       allowNull: true,
        defaultValue: "0"
     },
     

     review :
     {
       type: DataTypes.TEXT(),
        allowNull: true,
        defaultValue: ""

     },

     empId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
    },



    orderId: {
      type: DataTypes.STRING(255),
      allowNull: false
      
    },

    jobStatus: {
      type: DataTypes.INTEGER(5),
      allowNull: false,
        defaultValue: 1
    },


    cancellationReason: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },


    otherReason: {
      type: DataTypes.TEXT(),
      allowNull: true,
      defaultValue: ''

    },
    
    ratingOn: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },


    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

  
  }, {
    tableName: 'tiffinAssignedEmp',
    timestamps: false
  });
};
