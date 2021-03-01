/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('companyRatings', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

  
    orderId:{
      type: DataTypes.STRING(255),
      allowNull: true,
       defaultValue: ""
     },

     rating :
     {
       type: DataTypes.STRING(15),
       allowNull: true,
        defaultValue: "0"
     },
     
     foodQuality:{
      type: DataTypes.STRING(15),
      allowNull: true,
       defaultValue: "0"
     },

     packingPres:{
      type: DataTypes.STRING(15),
      allowNull: true,
       defaultValue: "0"
     },

     foodQuantity:{
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



    reviewImages: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('reviewImages') && this.getDataValue('reviewImages')!="")
        {
          var images=this.getDataValue('reviewImages').split(",")
          imageArray=[];
          for(var k=0;k<images.length;k++)
          {
            imageArray.push( config.IMAGE_APPEND_URL+"reviews/"+images[k]);
          }
          return  imageArray;
        }
        else return []

    },
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
   

    createdAt: {
      type: DataTypes.DATE(),
      allowNull: false,
      defaultValue: new Date()
    },

  
  }, {
    tableName: 'companyRatings',
    timestamps: false
  });
};
