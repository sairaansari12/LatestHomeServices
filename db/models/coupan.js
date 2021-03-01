/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('coupan', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    
    name: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true
    },

    offerType: {
      type: DataTypes.STRING(60),
      defaultValue: 'coupon',
      allowNull: true
    },

    code: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true,
    },
    discount: {
      type: DataTypes.STRING(60),
      defaultValue: '',
      allowNull: true, 
    },
    description: {
      type: DataTypes.STRING(255),
      defaultValue: '',
      allowNull: true, 
    },

    type: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: true, 
    },

    usageLimit: {
      type: DataTypes.INTEGER(5),
      defaultValue: 1,
      allowNull: true, 
    },

    categoryId: {
      type: DataTypes.STRING(50),
      defaultValue: "",
      allowNull: true, 
    },



    icon: {
      type: DataTypes.TEXT,
      get() {
        if(this.getDataValue('icon')!=null && this.getDataValue('icon')!="")
        return config.IMAGE_APPEND_URL+"coupans/icons/"+this.getDataValue('icon')
    },
      defaultValue: "",
      allowNull: true, 
    },

    thumbnail: {
      type: DataTypes.TEXT,
      get() {
        if( this.getDataValue('thumbnail')!=null && this.getDataValue('thumbnail')!="")
        return config.IMAGE_APPEND_URL+"coupans/thumbnails/"+this.getDataValue('thumbnail')
    },
      defaultValue: "",
      allowNull: true, 
    },
    validupto: {
      type: DataTypes.DATEONLY(),
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
      allowNull: true,
      references: {
        model: 'users',
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


   minimumAmount: {
    type: DataTypes.STRING(11),
    allowNull: false
 },



    createdAt: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    }
  }, {
    tableName: 'coupan',
    timestamps: false
  });
};
