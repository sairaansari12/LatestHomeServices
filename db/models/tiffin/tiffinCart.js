
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tiffinCart', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    
    tiffinId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tiffinServices',
          key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE',
      },

      quantity :
      {
        type: DataTypes.STRING(15),
              allowNull: false,
            
      }, 

      package:
      {
      type: DataTypes.STRING(15),
      allowNull: false
      },
          
      package:
      {
      type: DataTypes.STRING(15),
      allowNull: false
      },
        
  
  orderPrice :
   {
   type: DataTypes.STRING(15),
   allowNull: false,
   },

excDays :
{
  type: DataTypes.TEXT(),
        allowNull: true,
        defaultValue:''
},


fromDate :
{
  type: DataTypes.DATEONLY(),
        allowNull: false,
},

endDate :
{
  type: DataTypes.DATEONLY(),
        allowNull: false,
},

excAvailability :
{
  type: DataTypes.TEXT(),
        allowNull: true,
        defaultValue:''
},

excPrice :
{
  type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue:'0'
},



orderTotalPrice :
{
  type: DataTypes.STRING(15),
   allowNull: false,
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

  
    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

    updatedAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'tiffinCart',
    timestamps: false
  });
};
