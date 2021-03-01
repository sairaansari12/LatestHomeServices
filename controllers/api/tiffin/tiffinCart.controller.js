
const express = require('express');
const app = express();
const Op = require('sequelize').Op;
var _=require('underscore');
const { companyId } = require('../../../helpers/common');

const CART=db.models.cart
const SERVICES = db.models.services
//Relations
TIFFCART.belongsTo(TIFFSERVICES,{foreignKey: 'tiffinId'})


app.post('/add',checkAuth,async (req, res, next) => {
  const params = req.body;


  let responseNull=  commonMethods.checkParameterMissing([params.companyId,params.quantity,params.tiffinId,params.orderPrice,params.orderTotalPrice,params.fromDate,params.package])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  try{

		const oderData = await TIFFCART.findOne({
		where: {
      tiffinId: params.tiffinId,
      userId: req.id
		}
	  })  
      
    if(oderData)
    {


      var newQuantity=parseInt(oderData.dataValues.quantity)+parseInt(params.quantity)
      var norderPrice=parseInt(oderData.dataValues.orderPrice)+parseInt(params.orderPrice)
      var norderTotalPrice=parseInt(oderData.dataValues.orderTotalPrice)+parseInt(params.orderTotalPrice)

    TIFFCART.update({quantity:newQuantity,
    orderPrice:norderPrice,
     orderTotalPrice:norderTotalPrice
    },{where:{id:oderData.dataValues.id}})

      return responseHelper.post(res, appstrings.cart_success, oderData);

    }

   
   

else{

var orderPrice=params.orderPrice


// Write APPLY PROMO CODE HERE//

var endDate=params.fromDate

if(params.package.toLowerCase()=='weekly')
{
  var date = new Date(params.fromDate);
  date.setDate(date.getDate() + 7);
  console.log(date)
  endDate=date;
}


if(params.package.toLowerCase()=='monthly')
{
  var date = new Date(params.fromDate);
  date.setDate(date.getDate() + 30);
  endDate=date;

}


    const orderData = await TIFFCART.create({
  
      
      tiffinId: params.tiffinId,
      orderPrice :orderPrice,
      orderTotalPrice :params.orderTotalPrice,
      quantity :params.quantity,
      userId: req.id,
      companyId: params.companyId,
      excDays: params.excDays,
      excAvailability: params.excAvailability,
      excPrice: params.excPrice,
      package: params.package,
      fromDate: params.fromDate,
      endDate: endDate


      })  
      

      if(orderData) 

      return responseHelper.post(res, appstrings.cart_success, orderData);
      else return responseHelper.post(res, appstrings.oops_something, null,400);

}


 }
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})



app.put('/update',checkAuth,async (req, res, next) => {
  const params = req.body;


  let responseNull=  commonMethods.checkParameterMissing([params.cartId,params.companyId,params.quantity,params.tiffinId,params.orderPrice,params.orderTotalPrice,params.fromDate,params.package])

  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  try{
		const cartData = await TIFFCART.findOne({
		where: {
      id: params.cartId,
      userId: req.id
      
		}
	  })  
      
    if(cartData)
  {


    var endDate=params.fromDate

if(params.package.toLowerCase()=='weekly')
{
  var date = new Date(params.fromDate);
  date.setDate(date.getDate() + 7);
  console.log(date)
  endDate=date;
}


if(params.package.toLowerCase()=='monthly')
{
  var date = new Date(params.fromDate);
  date.setDate(date.getDate() + 30);
  endDate=date;

}


    const orderData = await TIFFCART.update(
      
      {
        tiffinId: params.tiffinId,
        orderPrice :params.orderPrice,
        orderTotalPrice :params.orderTotalPrice,
        quantity :params.quantity,
        userId: req.id,
        companyId: params.companyId,
        excDays: params.excDays,
        excAvailability: params.excAvailability,
        excPrice: params.excPrice,
        package: params.package,
        fromDate: params.fromDate,
        endDate: endDate
		
      },
     { where: {id:params.cartId}
      
    }
      )  
      
      if(orderData) 

      return responseHelper.post(res, appstrings.cart_update_success, null);

      else return responseHelper.post(res, appstrings.oops_something, null,400);

}

 
else return responseHelper.post(res, appstrings.no_record, null,204);

 }
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})


app.get('/list',checkAuth,async (req, res) => {
   var params=req.query
  var lat=0
   var lng=0
   if(params.lat) lat=parseFloat(params.lat)
   if(params.lng) lng=parseInt(params.lng)


    try {
      var orderData = await TIFFCART.findAll({
      
        order: [
          ['createdAt', 'DESC'],  
      ],
      where :{userId : req.id
       
      },
      
      include: [
        {model: TIFFSERVICES , attributes: ['id','name',"contactInfo",'tags','availability','packages','thumbnail','rating','totalRatings'],
      include:[{model:COMPANY, attributes:['companyName','address1',[sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(latitude)) * cos(radians("+lng+") - radians(longitude)) + sin(radians("+lat+")) * sin(radians(latitude)))"),'distance']]}]
        }]
      });

      if(orderData) 
     {

      var countDataq = await TIFFCART.findOne({
        attributes: ['id','userId',
          [sequelize.fn('sum', sequelize.col('orderTotalPrice')), 'totalSum'],
          [sequelize.fn('sum', sequelize.col('quantity')), 'totalQunatity'],
        ],
       
      where :{ userId : req.id
       
      }
});

 orderData=JSON.parse(JSON.stringify(orderData))
 countDataq=JSON.parse(JSON.stringify(countDataq))










 var data={}
 
data['sum']=countDataq.totalSum
data['totalQunatity']=countDataq.totalQunatity
data['data']=orderData

    


if(orderData.length>0)
    return responseHelper.post(res,appstrings.detail,data);
    else
    return responseHelper.post(res,appstrings.detail,data,204);


     }

     
    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
  });



  
app.get('/detail/:cartId',checkAuth,async (req, res) => {
  var cartId=req.params.cartId
  
  let responseNull=  commonMethods.checkParameterMissing([cartId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
   
    try {
      const orderData = await TIFFCART.findOne({
      where :{id :cartId},      
      include: [
        {model: TIFFSERVICES , attributes: ['id','name',"contactInfo",'tags','availability','packages','thumbnail']}
      

      
      ]

      });
     if(orderData) 
     
     {
     
    
      return responseHelper.post(res,appstrings.detail,orderData);


     }
      else return responseHelper.post(res,appstrings.no_record,null,204);
    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
 });


app.delete('/remove',checkAuth,async(req,res, next) => {
    const params = req.query;
    
    let responseNull=  common.checkParameterMissing([params.cartId])
    if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);
  
    try{
      const orderData = await TIFFCART.findOne({
      where: {
        id: params.cartId,
        userId: req.id
        
      }
      })  
        
      if(orderData)
     {

const numAffectedRows = await TIFFCART.destroy({
    where: {
      id: params.cartId
  
    }
    })  
      
    if(numAffectedRows>0)
    return responseHelper.post(res, appstrings.cart_delete_success,null);
   
  }
  else
  return responseHelper.post(res, appstrings.no_record,null, 204);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      
     });


app.delete('/clear',checkAuth,async(req,res, next) => {
      

      try{
      
  const numAffectedRows = await TIFFCART.destroy({
      where: {
        userId: req.id
      }
      })  
        
    if(numAffectedRows>0)
    return responseHelper.post(res, appstrings.cart_delete_success,null);
    
    else
    return responseHelper.post(res, appstrings.no_record,null, 204);
    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
        
       });

      
module.exports = app;



//Edit User Profile
