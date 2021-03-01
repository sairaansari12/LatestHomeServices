
const express = require('express');
const app = express();
const Op = require('sequelize').Op;
var dateFormat = require('dateformat');
var moment = require('moment');


//Relations
TIFFORDERS.belongsTo(ADDRESS,{foreignKey: 'addressId'})
TIFFORDERS.belongsTo(COMPANY,{foreignKey: 'companyId'})
TIFFORDERS.belongsTo(ORDERSTATUS,{foreignKey: 'progressStatus'})
TIFFORDERS.hasOne(TIFFPAYMENT,{foreignKey: 'orderId'})
TIFFORDERS.hasMany(TIFFASSIGNEDEMP,{foreignKey: 'orderId'})
TIFFASSIGNEDEMP.belongsTo(EMPLOYEE,{foreignKey: 'empId'})



app.post('/create',checkAuth,async (req, res, next) => {
  const params = req.body;

  let responseNull=  commonMethods.checkParameterMissing([params.addressId,params.serviceCharges,params.companyId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
   
  
  try{
		const findData = await TIFFPAYMENT.findOne({where: {userId: req.id,transactionStatus: 2},order: [
      ['createdAt','DESC']
    ],})  
      
     if(findData)
{
  TIFFORDERS.destroy({where:{id: findData.dataValues.orderId}})
  TIFFPAYMENT.destroy({where:{orderId: findData.dataValues.orderId}})


}
   
    var cartData = await TIFFCART.findOne({ where :{ userId : req.id }});
    if(cartData) 
   {


cartData=JSON.parse(JSON.stringify(cartData))



var orderPrice=cartData.orderPrice
var discountPrice=0
var serviceCharges=(params.serviceCharges && params.serviceCharges!="") ? params.serviceCharges :0
var totalPrice=parseFloat(orderPrice)+parseFloat(serviceCharges)

totalPrice=totalPrice-parseFloat(cartData.excPrice)



if(params.tip && params.tip!="")
totalPrice=totalPrice+parseFloat(params.tip)


// Write APPLY PROMO CODE HERE//

 //const cOrderData=null
    const cOrderData = await TIFFORDERS.create({
	
      addressId: params.addressId,
      fromDate: cartData.fromDate,
      tiffinId:cartData.tiffinId,
      endDate :cartData.endDate ,
      serviceCharges :serviceCharges,
      offerPrice: discountPrice,
      orderPrice: cartData.orderPrice,
      totalOrderPrice:totalPrice,
      userId: req.id,
      companyId: params.companyId,
      tip: params.tip,
      quantity:cartData.quantity,
      cookingInstructions: params.cookingInstructions,
      deliveryInstructions: params.deliveryInstructions,
      excPrice: cartData.excPrice,
      excDays: cartData.excDays,
      package: cartData.package,
      excAvailability: cartData.excAvailability

      })  
      
      if(cOrderData) 
      {

    paymentEntry(req.id,params.companyId,cOrderData.dataValues.id,totalPrice)
    updateUserTye(req.id)
    return responseHelper.post(res, appstrings.order_success, cOrderData);
     }
 


}
else return responseHelper.post(res, appstrings.no_item_cart,null, 204);




 }
catch (e) {
  console.log(e)
  return responseHelper.error(res, e.message, 400);
}
  
}) 

app.post('/status',checkAuth,async(req,res,next) => { 
    
  var params=req.body
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     
    

     var userData = await ORDERS.findOne({
       where: {
         id: params.id }
     });
     
     
     if(userData)
     {
     
if(params.status=="5" && userData.dataValues.trackStatus<3 )
return responseHelper.post(res, appstrings.job_not_completed,null,400);


  const updatedResponse = await ORDERS.update({
       progressStatus: params.status,

     },
     {
       where : {
       id: userData.dataValues.id
     }
     });
     
     if(updatedResponse)
           {
  if(params.status==5)
  {
    userData=JSON.parse(JSON.stringify(userData))
            var findData=await USER.findOne({where:{id:userData.userId}});
       var notifPushUserData={title:userData.orderNo +appstrings.order_mark_complete+ ' on ' +commonMethods.formatAMPM(new Date),
            description:userData.orderNo +appstrings.order_mark_complete + ' on ' +commonMethods.formatAMPM(new Date),
            token:findData.dataValues.deviceToken,  
                platform:findData.dataValues.platform,
                userId :userData.userId, role :3,
                notificationType:"ORDER_STATUS",status:5,
      }
      
commonNotification.insertNotification(notifPushUserData)   
 commonNotification.sendNotification(notifPushUserData)
    }
         return responseHelper.post(res, appstrings.success,null);
           }
           else{
             return responseHelper.post(res, appstrings.oops_something,400);
  
           }
     
     }

     else{
      return responseHelper.post(res, appstrings.no_record,204);

    }

       }
         catch (e) {
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});

app.post('/paymentStatus',checkAuth,async(req,res,next) => { 
    
  var params=req.body
  var paymentState=0
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.orderId,params.status])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     

      var orderData=await TIFFORDERS.findOne({
        where: {
          id: params.orderId,
         }
      });

      if(!orderData)
      return responseHelper.post(res, appstrings.oops_something,400);


else{
    if(params.status=="1") {
      paymentState=1
      TIFFCART.destroy({where:{userId: req.id}})
        
        sendNotification(req,orderData.dataValues.fromDate,orderData.dataValues.totalOrderPrice,orderData.dataValues.id,1,orderData.dataValues.companyId)

        
    }
    else{
      sendNotification(req,orderData.dataValues.fromDate,orderData.dataValues.totalOrderPrice,orderData.dataValues.id,2,orderData.dataValues.companyId)

    }

     const paymentData = await TIFFPAYMENT.findOne({
       where: {
         orderId: params.orderId,
         userId: req.id,
        }
     });
     
     
     if(paymentData)
     {
     

   
  const updatedResponse = await TIFFPAYMENT.update({
    userId: req.id,
    orderId:params.orderId ,
    transactionStatus:params.status ,
    paymentMode:params.paymentMode ,
    transactionId:params.transactionId ,
    paymentState:paymentState,
    updatedAt: new Date()

     },
     {
       where : {
       id: paymentData.dataValues.id
     }
     });
     
     if(updatedResponse)return responseHelper.post(res, appstrings.success,null);
     return responseHelper.post(res, appstrings.oops_something,400);
  
          
     
     }

     else{


      const createdResponse = await TIFFPAYMENT.create({
        userId: req.id,
        companyId: orderData.dataValues.companyId,
        orderId:params.orderId ,
        transactionStatus:params.status,
        paymentMode:params.paymentMode,
        transactionId:params.transactionId,
        paymentState:paymentState,
        amount:params.amount

    
         });
         if(createdResponse)return responseHelper.post(res, appstrings.success,null);
         return responseHelper.post(res, appstrings.oops_something,400);
    
        }
       }
      }
         catch (e) {
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});


function paymentEntry(userId,companyId,orderId,amount)
{

  try{
   TIFFPAYMENT.create({
    
    userId: userId,
    companyId: companyId,
    orderId:orderId ,
    amount:amount

   
    })  
  }
  catch(e)
  {console.log(e)}



}



app.get('/list',checkAuth,async (req, res) => {
   
    var params=req.query
   var progressStatus =  ['0','1','2','3','4','5']

    
    var page =1
    var limit =20
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    if(params.progressStatus && params.progressStatus!="")  progressStatus=params.progressStatus.split(",")


    //console.log(">>>>>>>>",progressStatus)
 
    var offset=(page-1)*limit

   
    try {
      var user = await TIFFORDERS.findAll({
        attributes:['id','package','tiffinId','fromDate','endDate','orderPrice','quantity','totalOrderPrice','progressStatus','createdAt'],
      where :{userId : req.id,
        progressStatus: { [Op.or]: progressStatus},

      },
      order: [
        ['createdAt', 'DESC']],
      offset: offset, limit: limit,
       
      include: [
        {model: db.models.address , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,
        {model: COMPANY , attributes: ['latitude','longitude'],required:true},
        {model: ORDERSTATUS , attributes: ['statusName','status']},
        {model: TIFFPAYMENT  , attributes: ['transactionStatus'],where:{transactionStatus:1},requird:true}
        
    ],


      });
user=JSON.parse(JSON.stringify(user))
      for(var t=0;t<user.length;t++)
      {

  var orderDate=new Date(user[t].createdAt)
var today=new Date()
var diffMins = diff_mins(today,orderDate); // milliseconds between now & Christmas

console.log("diffMins>>>>",diffMins)
if( diffMins<30 && user[t].progressStatus<5)  user[t].cancellable=true 
else  user[t].cancellable=false
 
delete  user[t]['company'];


}
if(user.length>0)
    return responseHelper.post(res,appstrings.detail,user);
    else     return responseHelper.post(res,appstrings.no_record,null,204);

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
  });


app.get('/detail/:orderId',checkAuth,async (req, res) => {
  var orderId=req.params.orderId
  
  let responseNull=  commonMethods.checkParameterMissing([orderId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
   
    try {
      const orderData = await TIFFORDERS.findOne({
      where :{id :orderId},  
      include: [
        {model: ADDRESS , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,
        {model: ORDERSTATUS , attributes: ['statusName','status']},
        {model: COMPANY , attributes: ['latitude','longitude'],required:true},      
        {model: TIFFASSIGNEDEMP , attributes: ['id','jobStatus'],
         where:{jobStatus :[1,3]},
         required: false,
         include: [{
         model: EMPLOYEE,
         attributes: ['id','firstName','lastName','countryCode','phoneNumber','image'],
         required: false
    }]
    }
      
      ]

      });
     if(orderData) 
     
     {
     var   deliveryIn=[];

         if(orderData.dataValues.deliveryInstructions && orderData.dataValues.deliveryInstructions!="")
         {
          var instructions=await TIFFINSTRUCTIONS.findOne({where:{status:1}});
          var dataIn=(instructions.dataValues.deliveryInstructions&& instructions.dataValues.deliveryInstructions!="")?JSON.parse(instructions.dataValues.deliveryInstructions):[];

for(var k=0;k<dataIn.length;k++)
{
if(orderData.dataValues.deliveryInstructions.includes(dataIn[k].id))
deliveryIn.push(dataIn[k].heading)

}
         }

         orderData.dataValues.deliveryInstructions=  deliveryIn;
    
      return responseHelper.post(res,appstrings.detail,orderData);


     }
      else return responseHelper.post(res,appstrings.no_record,null,204);
    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
  });

app.get('/instructions',checkAuth,async (req, res) => {

     
      try {
        const orderData = await TIFFINSTRUCTIONS.findOne({
        where :{status :1},      
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
  
app.post('/cancel',checkAuth,async (req, res, next) => {
    const params = req.body;
  
  
    let responseNull=  commonMethods.checkParameterMissing([params.orderId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    
    try{
      const orderData = await TIFFORDERS.findOne({
      where: {
        id: params.orderId,
        userId: req.id
        
      }
      })  
        
      if(orderData)
     {
  

var orderDate=new Date(orderData.dataValues.createdAt)
var today=new Date()
var diffMins = diff_mins(today,orderDate);
if(orderData.progressStatus>=1 &&  diffMins>30)
return responseHelper.post(res, appstrings.order_not_cancel, null,400);


else
{
 
  const updatedResponse = await TIFFORDERS.update({
    progressStatus: 2,
    cancellationReason:params.cancellationReason
  },
  {
    where : {
    id: orderData.dataValues.id
  }
  });
  
        
        if(updatedResponse) 
  {
       orderData.dataValues.progressStatus=3
       orderData.dataValues.cancellationReason=params.cancellationReason

        return responseHelper.post(res, appstrings.cancel_success, orderData);
  }
        else return responseHelper.post(res, appstrings.oops_something, null,400);
  
  }
}

  else return responseHelper.post(res, appstrings.no_record, null,204);


   }
  catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }
    
  })
  

     function diff_mins(dt2, dt1) 
 {

  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff*60));
  
 }
     
 async function updateUserTye(userId)
{
  var type=1
 ORDERS.findAll({where:{userId:userId}}).then(data=>
 {
if(data && (data.length>0 && data.length<6)) type=2 
if(data && (data.length>=6 && data.length<15)) type=3 

USER.update({userType:type},{where:{id:userId}})

 }).catch(err=>{
console.log(err)
 })
 


}
 async function sendNotification(req,serviceDateTime,totalPrice,orderId,status,companyId)
{
  
   
var userData=await USER.findOne({where:{id:req.id}});
var countryCode="",phoneNumber=""
if(userData &&userData.dataValues)
{
phoneNumber=userData.dataValues.phoneNumber
countryCode=userData.dataValues.countryCode

}
var notifData=null
var notifUserData=null
var notifPushUserData=null

if(status==1)
{

 notifData={title:appstrings.new_order_title+" "+commonMethods.formatAMPM(new Date(serviceDateTime)),
      description:appstrings.new_order_description +" " +commonMethods.formatAMPM(new Date(serviceDateTime)) + " Contact : +"+countryCode+" "+phoneNumber,
      userId:companyId,
      orderId:orderId,
      role:2}

  notifUserData={title:appstrings.order_placed+" "+commonMethods.formatAMPM(new Date(serviceDateTime)),
      description:appstrings.order_placed +" " +commonMethods.formatAMPM(new Date(serviceDateTime)) + " Rs : "+totalPrice,
      userId:req.id,
      orderId:orderId,
      role:3}

  notifPushUserData={title:appstrings.order_placed+" "+commonMethods.formatAMPM(new Date(serviceDateTime)),
      description:appstrings.order_placed +" " +commonMethods.formatAMPM(new Date(serviceDateTime)) + " Rs : "+totalPrice,
      token:userData.dataValues.deviceToken, 
      orderId:orderId,
           platform:userData.dataValues.platform,notificationType:"ORDER_PLACED_TIFFIN",status:0,
}


}
else{
  notifData={title:appstrings.order_failed+" , Date: "+commonMethods.formatAMPM(new Date(serviceDateTime)),
  description:appstrings.order_failed +"  , Date: " +commonMethods.formatAMPM(new Date(serviceDateTime)) + " Contact : +"+countryCode+" "+phoneNumber,
  userId:companyId,
  orderId:orderId,
  role:2}

notifUserData={title:appstrings.order_failed+" , Date: "+commonMethods.formatAMPM(new Date(serviceDateTime)),
  description:appstrings.order_failed +"  , Date: " +commonMethods.formatAMPM(new Date(serviceDateTime)) + " Rs : "+totalPrice,
  userId:req.id,
  orderId:orderId,
  role:3}

notifPushUserData={title:appstrings.order_failed+" , Date: "+commonMethods.formatAMPM(new Date(serviceDateTime)),
  description:appstrings.order_failed +" , Date : " +commonMethods.formatAMPM(new Date(serviceDateTime)) + " Rs : "+totalPrice,
  token:userData.dataValues.deviceToken, 
  orderId:orderId,
       platform:userData.dataValues.platform,notificationType:"ORDER_PLACED_TIFFIN",status:0,
}


}

commonNotification.insertNotification(notifData)   
commonNotification.insertNotification(notifUserData)   
commonNotification.sendNotification(notifPushUserData)   

}

module.exports = app;



//Edit User Profile
