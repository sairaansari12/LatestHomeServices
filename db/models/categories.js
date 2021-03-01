/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('categories', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    parentId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: 0
      
  },


    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },

    icon: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('icon')!="")
        return config.IMAGE_APPEND_URL+"services/icons/"+this.getDataValue('icon')
        else return ""

    },
      defaultValue: ""
    },

    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('thumbnail')!="")
        return config.IMAGE_APPEND_URL+"services/thumbnails/"+this.getDataValue('thumbnail')
        else return ""

    },
     
      defaultValue: ""
    },


    orderby: {
      type: DataTypes.INTEGER(20),
      allowNull: true
    },

    level: {
      type: DataTypes.INTEGER(20),
      defa: true
      
    },

    
    connectedCat: {
      type: DataTypes.TEXT,
      allowNull: false,
    
      defaultValue: ""
    },

    colorCode: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: ""
    },



    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
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
    tableName: 'categories',
    timestamps: false
  });
};
