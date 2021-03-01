const express = require('express');
const app = express();
const db = require('../../db/db');
const moment   = require('moment');

const Op             = require('sequelize').Op;


//////////////////////////////////////////////
///////////////////////// PromoCode Api //////
//////////////////////////////////////////////

SERVICERATINGS.belongsTo(ORDERS,{foreignKey: 'orderId'})
SERVICERATINGS.belongsTo(USERS,{foreignKey: 'userId'})
USERS.belongsTo(ADDRESS,{foreignKey: 'id',targetKey: 'userId',as:'useraddress'})


//SERVICE RATING
app.get('/serviceRatings', checkAuth,async (req, res, next) => {

  var params=req.query
  try{
    let responseNull=  commonMethods.checkParameterMissing([params.serviceId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    var page =1
    var limit =100
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit


    var subData = await SERVICERATINGS.findAll({
      attributes: ['id','rating','review','createdAt'],
    
      where: {
        serviceId:  params.serviceId,
        rating:  {[Op.not]: '0'}

      },
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: true,
        include:{required:false,as :'useraddress' ,model:ADDRESS,attributes:['addressName','city'],where:{[Op.or]:[{default:1},{addressType:{ [Op.like]: '%home%' }}]} }

        }],
      order: [['createdAt', 'DESC']],
      offset: offset, limit: limit,

    })
    

    const ratData = await SERVICERATINGS.findOne({
      attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating']],
    where: {
      serviceId:  params.serviceId}
    })
    

let dataToSend={}
if(subData && subData.length>0) 
{
  dataToSend.avgRating=ratData.dataValues.totalRating
  dataToSend.data=subData

  return responseHelper.post(res, appstrings.success,dataToSend)
}
    else
 return responseHelper.post(res, appstrings.no_record,null,204);

  }
  catch(e){
    return responseHelper.error(res, e.message, 400);
  }
});


//SERVICE RATING
app.get('/companyRatings', checkAuth,async (req, res, next) => {

  var params=req.query
  try{
    let responseNull=  commonMethods.checkParameterMissing([params.companyId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    var page =1
    var limit =100
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit


    var subData = await COMPANYRATING.findAll({
  
      where: {
        companyId:  params.companyId,
        rating:  {[Op.not]: '0'}

      },
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: true,
        include:{required:false,as :'useraddress' ,model:ADDRESS,attributes:['addressName','city'],where:{[Op.or]:[{default:1},{addressType:{ [Op.like]: '%home%' }}]} }
        }],
      order: [['createdAt', 'DESC']],
      offset: offset, limit: limit,

    })
    

    const ratData = await commonMethods.getCompAvgRating(params.companyId)
    

let dataToSend={}
if(subData && subData.length>0) 
{
  dataToSend.avgRating=ratData.dataValues.totalRating
  dataToSend.data=subData

  return responseHelper.post(res, appstrings.success,dataToSend)
}
    else
 return responseHelper.post(res, appstrings.no_record,null,204);

  }
  catch(e){
    return responseHelper.error(res, e.message, 400);
  }
});


// ///////// Add service /////////////////////////
// app.post('/addRating', checkAuth,async (req, res, next) => {
//   try{
//     const data    = req.body;
//     //Get Coupan Details

//     let responseNull=  commonMethods.checkParameterMissing([data.orderId,data.ratingData])
//   if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
//   var datatoUpdated=JSON.parse(JSON.stringify(data.ratingData))





//     for(var h=0;h<datatoUpdated.length;h++)
//     {


//       await SERVICERATINGS.create({
//         rating: datatoUpdated[h].rating,
//         review: datatoUpdated[h].review,
//         serviceId: datatoUpdated[h].serviceId,
//         userId: req.id,
//         orderId: data.orderId

//       });
      
//     }
    
//       return responseHelper.post(res, appstrings.rating_added,null);
      
    
//   }
//   catch (e) {
//     return responseHelper.error(res, e.message, 400);
//   }
// });


///////// Add Staff /////////////////////////
app.post('/addStaffRating', checkAuth,async (req, res) => {
  try{
    const data    = req.body;
    //Get Coupan Details

    let responseNull=  commonMethods.checkParameterMissing([data.companyId,data.rating,data.empId,data.orderId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  var findData=await EMPLOYEE.findOne({where:{id:data.empId}});

if(findData)
{
   
        var response= await STAFFRATINGS.create({
           rating: data.rating,
           review: data.review,
           empId: data.empId,
           orderId: data.orderId,
           userId: req.id,
           companyId: data.companyId


         });
        
        if(response)
        {

var ordersData=await ORDERS.findOne({attributes:['orderNo'],where:{id:data.orderId}})

        var notifPushUserData={title:data.rating +" "+appstrings.new_rating_added+"  "+commonMethods.formatAMPM(new Date),
          description:data.rating +" "+ appstrings.new_rating_added+'  ' +commonMethods.formatAMPM(new Date) +" For order No- "+ordersData.dataValues.orderNo,
          token:findData.dataValues.deviceToken,  
              platform:findData.dataValues.platform,
              userId :findData.id, role :4,
              orderId:data.orderId,
              notificationType:"FEEDBACK",status:0,
        }
        
        commonNotification.insertNotification(notifPushUserData)   
        commonNotification.sendEmpNotification(notifPushUserData)

      }

        
        
      return responseHelper.post(res, appstrings.rating_added,null);
    }
    else
    return responseHelper.post(res, appstrings.no_record,null,204);

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});



///////// Add vendor rating /////////////////////////
app.post('/addRating', checkAuth, async (req, res, next) => {
  try {
    const data = req.body;
    //Get Coupan Details

    let responseNull = commonMethods.checkParameterMissing([data.companyId])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);
    var companyrating,orderrating ;
//to check if its company rating or order rating
    if(data.orderId){
      //order rating
      orderrating = await COMPANYRATING.findOne({ 
        where: { 
          userId: req.id,
          companyId: data.companyId,
          orderId: data.orderId
        } 
      })
    } else{
      // company rating
      companyrating = await COMPANYRATING.findOne(
        { where: { 
          userId: req.id,
          companyId: data.companyId,
          [Op.or]:[{
            orderId: ""
          },{
            orderId: null
          }
        ]
         } 
      })

    }

    var upload = []
    if (req.files && req.files['images']) {
      var fdata = req.files['images']
      if (fdata.length && fdata.length > 0) {

        for (var k = 0; k < fdata.length; k++) {

          ImageFile = req.files['images'][k];
          bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
          upload.push(bannerImage)
          ImageFile.mv(config.UPLOAD_DIRECTORY + "reviews/" + bannerImage, function (err) {
            //upload file
            if (err)
              return responseHelper.error(res, err.meessage, 400);
          });
        }

      }

      else {
        ImageFile = req.files['images'];
        bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
        upload.push(bannerImage)
        ImageFile.mv(config.UPLOAD_DIRECTORY + "reviews/" + bannerImage, function (err) {
          //upload file
          if (err)
            return responseHelper.error(res, err.meessage, 400);
        });

      }

    }
    if (!data.orderId) {
        if(companyrating){
          if (upload.length == 0 && companyrating.dataValues.reviewImages) {
            upload = companyrating.dataValues.reviewImages
          }
          await COMPANYRATING.update({
            rating: data.rating,
            foodQuality: data.foodQuality,
            foodQuantity: data.foodQuantity,
            packingPres: data.packingPres,
            review: data.review,
            reviewImages: upload.toString(),
          }, { where: { id: companyrating.dataValues.id, companyId: data.companyId,[Op.or]:[{ orderId: ""},{
            orderId: null}] } });
        } else{
          await COMPANYRATING.create({
            rating: data.rating,
            foodQuality: data.foodQuality,
            foodQuantity: data.foodQuantity,
            packingPres: data.packingPres,
            review: data.review,
            userId: req.id,
            orderId: data.orderId,
            reviewImages: upload.toString(),
            companyId: data.companyId
          });
        } 
    }  else {
      if(orderrating){
        if (upload.length == 0 && orderrating.dataValues.reviewImages) {
          upload = orderrating.dataValues.reviewImages
  
        }
        await COMPANYRATING.update({
          rating: data.rating,
          foodQuality: data.foodQuality,
          foodQuantity: data.foodQuantity,
          packingPres: data.packingPres,
          review: data.review,
          reviewImages: upload.toString(),
        }, { where: { id: orderrating.dataValues.id, companyId: data.companyId, orderId: data.orderId } });
      } else{
        await COMPANYRATING.create({
          rating: data.rating,
          foodQuality: data.foodQuality,
          foodQuantity: data.foodQuantity,
          packingPres: data.packingPres,
          review: data.review,
          userId: req.id,
          orderId: data.orderId,
          reviewImages: upload.toString(),
          companyId: data.companyId
        });
      } 
    }    


    //ADD SERVICE RATIUNGS

    if (data.ratingData && data.ratingData.length > 0) {
      var datatoUpdated = []
      if (typeof data.ratingData == "string")
        datatoUpdated = JSON.parse(data.ratingData)
      else
        datatoUpdated = JSON.parse(JSON.stringify(data.ratingData))

      for (var h = 0; h < datatoUpdated.length; h++) {

        SERVICERATINGS.create({
          rating: datatoUpdated[h].rating,
          // review: datatoUpdated[h].review,
          review:  data.review,
          serviceId: datatoUpdated[h].serviceId,
          userId: req.id,
          orderId: data.orderId

        });

      }

    }

    return responseHelper.post(res, appstrings.rating_added, null);
  }


  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});


///////// Add App Feedback /////////////////////////
app.post('/appRating', checkAuth,async (req, res) => {
  try{
    const data    = req.body;

    let responseNull=  commonMethods.checkParameterMissing([data.rating])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  

  var userrating=await APPRATINGS.findOne({where:{userId:req.id}})

  var response=null
      if(!userrating) 
      {  response= await APPRATINGS.create({
           rating: data.rating,
           review: data.review,
           userId: req.id
         });
        
        }
        else{
          response=await APPRATINGS.update({
            rating: data.rating,
            review: data.review
           
          },{where:{userId:req.id}});
        }

        console.log(response)
        if(response)
      
          return responseHelper.post(res, appstrings.rating_added,null);

       else
      return responseHelper.post(res, appstrings.oops_something,null,400);

        
        
    
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});



module.exports = app;