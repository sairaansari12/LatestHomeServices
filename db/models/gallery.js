/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gallery', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
      
    },
    mediaType: {
        type: DataTypes.STRING(256),
        allowNull: false,
    },

   
   

    
    mediaUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },

    mediaHttpUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('mediaHttpUrl') && this.getDataValue('mediaHttpUrl')!="")
        {
       return  config.IMAGE_APPEND_URL+"gallery/"+this.getDataValue('mediaHttpUrl')  ;
        }
        else return ""

    },
      defaultValue: ""
    },


    title: {
      type: DataTypes.STRING(256),
      allowNull: true,
      defaultValue:""
  },

  description: {
    type: DataTypes.TEXT(),
    allowNull: true,
    defaultValue:""
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
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: ''
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
    updatedAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'gallery',
    timestamps: false
  });
};
