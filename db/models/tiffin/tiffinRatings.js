/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tiffinRatings', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

  

     tiffinId: {
        type: DataTypes.UUID,
        allowNull: false
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


     reviewImages: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('reviewImages')!="")
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



    orderId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue:'',
     
    },

   

    createdAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: new Date()
    },

  
  }, {
    tableName: 'tiffinRatings',
    timestamps: false
  });
};
