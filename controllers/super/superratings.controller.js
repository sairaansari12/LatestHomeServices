
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

COMPANYRATING.belongsTo(USERS,{foreignKey: 'userId'})
APPRATINGS.belongsTo(USERS,{foreignKey: 'userId'})

app.post('/getData',superAuth, async (req, res, next) => {
    
  var params=req.body
  

   var page =1
   var limit =20
   var orderby='createdAt'
   var orderType='ASC'

   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }


  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {rating:  {[Op.not]: '0'}}

  

    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {review: {[Op.like]: `%${params.search}%`}},
        {rating: { [Op.like]: `%${params.search}%` }}
      
      ],

    }

  }
    
  

      try{
      
    

    var ratingData = await APPRATINGS.findAndCountAll({
      attributes: ['id','rating','review','userId','createdAt'],
  
      where: where

      ,
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: false
        },

      
      ],
      order: [[orderby, orderType]],
      distinct:true,
      offset: offset, limit: limit,

    })
    

    

    return responseHelper.post(res, appstrings.message,ratingData);

        //return res.render('super/ratings/ratingsListing.ejs',{avgRating : ratData.dataValues.totalRating,data:ratingData,catData:cdata});



      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(superadminpath+"ratings");
      }


});

app.get('/',superAuth, async (req, res, next) => {
    
    try {
      

return res.render('super/ratings/ratingsListing.ejs');
      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(superadminpath+"ratings");
      }


});

app.post('/delete',superAuth,async(req,res,next) => { 
  
  var params=req.body
  var id=params.id

  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  
    return responseHelper.error(res, appstrings.required_field,400);

    const findData = await APPRATINGS.destroy({where:{id: id}});
   
    return responseHelper.post(res, appstrings.delete_success,null);

    } catch (e) {
      return responseHelper.error(res, e.message,400);
    }


 
});

app.get('/company/',superAuth, async (req, res, next) => {
    
    try {
      var  restro =await COMPANY.findAll({where:{parentId:req.id}})
return res.render('super/ratings/companyRatings.ejs',{restro});
      } catch (e) {
       return responseHelper.error(res, e.message, 400);
     
      }


});

app.post('/company/getData',superAuth, async (req, res, next) => {
    
  var params=req.body
  

   var page =1
   var limit =20
   var orderby='createdAt'
   var orderType='ASC'
    var fromDate=""
    var toDate=""
    var companyId=""
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }


  if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
  if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())
  if(params.companyId) companyId=params.companyId


  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {
    
    }

    
    if(fromDate!="" && toDate!="")
    {
      where= {
        createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
      }
    }
    


    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {review: {[Op.like]: `%${params.search}%`}},
        {rating: { [Op.like]: `%${params.search}%` }}
      
      ],

    }

  }
    
  if(companyId!="")
  where.companyId=companyId

      try{
      
    



    var ratingData = await COMPANYRATING.findAndCountAll({
      where: where

      ,
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: false
        },
      ],
      order: [[orderby, orderType]],
      distinct:true,
      offset: offset, limit: limit,

    })
    



    var data={}
    data.ratingData=ratingData
    
        var rating =0;
        var packingPres=0
        var foodQuality=0
        var foodQuantity=0


        var dataRating=await commonMethods.getCompAvgRating(companyId) 
        if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
        
        {rating=dataRating.dataValues.totalRating}
        foodQuality=dataRating.dataValues.foodQuality
        packingPres=dataRating.dataValues.packingPres
        foodQuantity=dataRating.dataValues.foodQuantity



        
        
          data.avgRating=rating
        data.foodQuality=foodQuality
        data.packingPres=packingPres
        data.foodQuantity=foodQuantity
      

        return responseHelper.post(res, appstrings.message,data);
    


        //return res.render('super/ratings/ratingsListing.ejs',{avgRating : ratData.dataValues.totalRating,data:ratingData,catData:cdata});



      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(superadminpath+"ratings");
      }


});

app.post('/company/delete',superAuth,async(req,res,next) => { 
  
  var params=req.body
  var id=params.id

  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  
    return responseHelper.error(res, appstrings.required_field,400);

    const findData = await COMPANYRATING.destroy({where:{id: id}});

   
    return responseHelper.post(res, appstrings.delete_success,null);




    } catch (e) {
      return responseHelper.error(res, e.message,400);
    }


 
});

app.post('/product/ratings',superAuth, async (req, res, next) => {
    
  var params=req.body
  
   var categoryId =""

   var page =1
   var limit =20
   var orderby='createdAt'
   var orderType='ASC'

   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }

  if(params.categoryId) categoryId=params.categoryId

  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {serviceId:  params.serviceId}

    


    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {review: {[Op.like]: `%${params.search}%`}},
        {rating: { [Op.like]: `%${params.search}%` }}
      
      ],
      serviceId:  params.serviceId

    }

  }
    
  

      try{
      
    

    var ratingData = await SERVICERATINGS.findAndCountAll({
      attributes: ['id','rating','review','serviceId','orderId','createdAt'],
  
      where: where

      ,
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: false
        },
{
        model: SERVICES,
        attributes: ['id','categoryId','name'],
        required: true,
        companyId:req.companyId,
        required: true
          }],


        
      
      
      
      order: [[orderby, orderType]],
      distinct:true,
      offset: offset, limit: limit,

    })
    

    

    return responseHelper.post(res, appstrings.message,ratingData);

        //return res.render('admin/ratings/ratingsListing.ejs',{avgRating : ratData.dataValues.totalRating,data:ratingData,catData:cdata});



      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(adminpath+"ratings");
      }


});

app.get('/products',superAuth, async (req, res, next) => {
    
  var params=req.query
    try {
      

      var dataRating= await commonMethods.getServiceAvgRating(params.serviceId)
  
          var total =0
          var avgRating =0
  
          if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) avgRating=dataRating.dataValues.totalRating
          if(dataRating && dataRating.dataValues && dataRating.dataValues.totalNoRating) total=dataRating.dataValues.totalNoRating
  
         var  permissions =await PERMISSIONS.findOne({where:{companyId:req.id}})
return res.render('super/ratings/productRatings.ejs',{total:total,avgRating,avgRating,permissions});
      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(adminpath+"ratings");
      }


});
app.post('/products/delete',superAuth,async(req,res,next) => { 
  
  var params=req.body
  var id=params.id

  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  
    return responseHelper.error(res, appstrings.required_field,400);

    const findData = await SERVICERATINGS.destroy({where:{id: id}});
   
    return responseHelper.post(res, appstrings.delete_success,null);

    } catch (e) {
      return responseHelper.error(res, e.message,400);
    }


 
});







module.exports = app;

//Edit User Profile
