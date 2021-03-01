const express = require('express');
const app = express();
const Op = require('sequelize').Op;
var _=require('underscore')

//Relations

TIFFSERVICES.belongsTo(COMPANY,{foreignKey: 'companyId'})
TIFFINMENU.belongsTo(COMPANY,{foreignKey: 'companyId'})
TIFFINMENU.belongsTo(TIFFSERVICES,{foreignKey: 'tiffinId'})
TIFFINPACKAGE.belongsTo(COMPANY,{foreignKey: 'companyId'})
TIFFINPACKAGE.belongsTo(TIFFSERVICES,{foreignKey: 'tiffinId'})
//Home API with cats and trending and banners



app.post('/home', checkAuth,async (req, res, next) => {

  var params=req.body
  
   var lat=0
   var lng=0
   var page =1
   var limit =20
   var itemType=['0','1','2']
   var orderby=sequelize.literal('`company.distance`')
   var orderType='ASC'

   if(params.itemType && params.itemType!="") itemType=[params.itemType]
   if(params.lat) lat=parseFloat(params.lat)
   if(params.lng) lng=parseInt(params.lng)
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }


  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {status:1,
    itemType:  {[Op.or]: itemType},
    }

      var PackArray=[]
       if(params.packages && params.packages!="")
       {
         if(params.packages.split(",").length>0)
       PackArray=params.packages.split(",")
      else PackArray=[params.packages]
       
     
      where=
      {
        packages:{[Op.like]: '%'+ params.packages + '%'},
        itemType: {[Op.or]: itemType},
           status:1
    }
  }

    
    if(params.search && params.search!="")
    
    where.name={[Op.like]: '%'+ params.search + '%'}
    
  

      


    try{


      var services = await TIFFSERVICES.findAll({
        attributes: ['id','name','description','contactInfo','tags','availability','packages','deliveryTimings','icon','thumbnail','itemType','companyId','totalRatings','rating','area'],
        where: where,
        include: [{model:COMPANY,
        attributes:['id','companyName',[sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(latitude)) * cos(radians("+lng+") - radians(longitude)) + sin(radians("+lat+")) * sin(radians(latitude)))"),'distance']],
      }],
      order: [[orderby,orderType]],
      offset:offset,limit:limit
      })



      if(services.length>0)
      return responseHelper.post(res, appstrings.success, services);

      else
      return responseHelper.post(res, appstrings.no_record, null,204);


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});


app.get('/detail', checkAuth,async (req, res, next) => {

  var params=req.query
  var tiffinId=params.tiffinId
  let responseNull=  commonMethods.checkParameterMissing([tiffinId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  

      

    try{

      var services = await TIFFSERVICES.findOne({
        attributes: ['id','name','contactInfo','deliveryTimings','thumbnail','itemType','rating','totalRatings'],
        where: {id:tiffinId}
  
      })


      if(services)
      {
      var menu = await TIFFINMENU.findAll({
        attributes: ['id','dayName','bMeal','bPrice','lMeal','lPrice','dMeal','dPrice'],
        where: {tiffinId:tiffinId}
  
      })


      var packages = await TIFFINPACKAGE.findAll({
        attributes: ['id','packageName','price','oneTimePrice'],
        where: {tiffinId:tiffinId}
  
      })


      var dataToSend={}
      dataToSend.menu=menu
      dataToSend.info=services
      dataToSend.packages=packages

      return responseHelper.post(res, appstrings.detail, dataToSend);

    }
      else
      return responseHelper.post(res, appstrings.no_record, null,204);


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});





module.exports = app;