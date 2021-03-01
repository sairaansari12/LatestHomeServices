const express = require('express');
const app = express();
const Op             = require('sequelize').Op;



//////////////////////////////////////////////
///////////////////////// PromoCode Api //////
//////////////////////////////////////////////

TIFFRATINGS.belongsTo(TIFFORDERS,{foreignKey: 'orderId'})
TIFFRATINGS.belongsTo(USERS,{foreignKey: 'userId'})


//SERVICE RATING
//SERVICE RATING
app.get('/list', checkAuth,async (req, res, next) => {

  var params=req.query
  try{
    let responseNull=  commonMethods.checkParameterMissing([params.tiffinId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    var page =1
    var limit =100
    var where= {tiffinId:  params.tiffinId,
    rating:  {[Op.not]: '0'}}



    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)

    if(params.filterRating && params.filterRating!="") where.rating=parseFloat(params.filterRating)

    var offset=(page-1)*limit


    var subData = await TIFFRATINGS.findAll({
      attributes: ['id','rating','review','reviewImages','createdAt'],
    
      where: where,
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: true
        }],
      order: [['createdAt', 'DESC']],
      offset: offset, limit: limit,

    })
    

    const ratData = await commonMethods.getTiffinAvgRating(params.tiffinId)
    

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

    


///////// Add Coupan /////////////////////////
app.post('/addRating', checkAuth,async (req, res, next) => {
  try{
    const params    = req.body;
    //Get Coupan Details
//console.log(req.files)
    let responseNull=  commonMethods.checkParameterMissing([params.rating,params.tiffinId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  

 
var upload=[]
//console.log(">>>>>>>>>>>>>>>>",req.files['productImages#'+datatoUpdated[h].serviceId])
      if(req.files && req.files['images'])
      {
var fdata=req.files['images']

if(fdata.length && fdata.length>0)
{

for(var k=0;k<fdata.length;k++)
  {

       ImageFile = req.files['images'][k];    
  
         bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
          upload.push(bannerImage)
           ImageFile.mv(config.UPLOAD_DIRECTORY +"reviews/"+ bannerImage, function (err) {
              //upload file
              if (err)
              return responseHelper.error(res, err.meessage, 400);   
            });
  }
  
  
}

else{
  ImageFile = req.files['images'];    

  bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
   upload.push(bannerImage)
    ImageFile.mv(config.UPLOAD_DIRECTORY +"reviews/"+ bannerImage, function (err) {
       //upload file
       if (err)
       return responseHelper.error(res, err.meessage, 400);   
     });

  
}

      }





      var result=await TIFFRATINGS.create({
        rating:params.rating,
        review: params.review,
        tiffinId:params.tiffinId,
        userId:req.id,
        orderId:params.orderId,
        reviewImages:upload.toString(),
    
      })
    
  

      if(result)return responseHelper.post(res, appstrings.rating_added,null);
      else     return responseHelper.error(res, appstrings.oops_something, 400);

    
  }
  catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }
});



module.exports = app;