
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

COMPANYRATING.belongsTo(USERS,{foreignKey: 'userId'})
SERVICERATINGS.belongsTo(SERVICES,{foreignKey: 'serviceId'})
STAFFRATINGS.belongsTo(USERS,{foreignKey: 'userId'})
STAFFRATINGS.belongsTo(ORDERS,{foreignKey: 'orderId'})
STAFFRATINGS.belongsTo(EMPLOYEE,{foreignKey: 'empId'})
COMPANYRATING.belongsTo(ORDERS,{foreignKey: 'orderId'})

app.post('/getData',adminAuth, async (req, res, next) => {
    
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
        include :[{
          model: CATEGORY,
          as :"category",
          attributes: ['id','connectedCat','name'],
          where: {[Op.or]:[
            {id:categoryId},
            {connectedCat: {
              [Op.like]: '%'+ categoryId + '%'}}

          ]
              
          },
          required: true
          }]


        }
      
      
      ],
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



app.post('/product/ratings',adminAuth, async (req, res, next) => {
    
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

app.get('/products',adminAuth, async (req, res, next) => {
    
  var params=req.query
    try {
      

      var dataRating= await commonMethods.getServiceAvgRating(params.serviceId)
  
          var total =0
          var avgRating =0
  
          if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) avgRating=dataRating.dataValues.totalRating
          if(dataRating && dataRating.dataValues && dataRating.dataValues.totalNoRating) total=dataRating.dataValues.totalNoRating
  
         var  permissions =await PERMISSIONS.findOne({where:{companyId:req.id}})
return res.render('admin/ratings/productRatings.ejs',{total:total,avgRating,avgRating,permissions});
      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(adminpath+"ratings");
      }


});


app.get('/',adminAuth, async (req, res, next) => {
    
  var params=req.query
    try {
      
      var  permissions =await PERMISSIONS.findOne({where:{companyId:req.id}})

    var cdata =  await commonMethods.getAllowedCategories(req.parentCompany,req.id,req.role)


return res.render('admin/ratings/ratingsListing.ejs',{catData:cdata,permissions});
      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(adminpath+"ratings");
      }


});




app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
    return res.render('admin/ratings/addRatings.ejs');

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});


app.post('/delete',adminAuth,async(req,res,next) => { 
  
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

app.get('/company/',adminAuth, async (req, res, next) => {
    
  var params=req.query
    try {
      var  permissions =await PERMISSIONS.findOne({where:{companyId:req.id}})

return res.render('admin/ratings/companyRatings.ejs',{permissions});
      } catch (e) {
       return responseHelper.error(res, e.message, 400);
     
      }


});

app.post('/company/getData',adminAuth, async (req, res, next) => {
    
  var params=req.body
  

   var page =1
   var limit =20
   var orderby='createdAt'
   var orderType='ASC'
    var fromDate=""
    var toDate=""
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }


  if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
  if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())


  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {
    companyId:req.id
    
    }

    
    if(fromDate!="" && toDate!="")
    {
      where= {
        companyId:req.id,
        createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
      }
    }
    


    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {review: {[Op.like]: `%${params.search}%`}},
        {rating: { [Op.like]: `%${params.search}%` }}
      
      ],
      companyId:req.id

    }

  }
    
  

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


        var dataRating=await commonMethods.getCompAvgRating(req.id) 
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
    


        //return res.render('admin/ratings/ratingsListing.ejs',{avgRating : ratData.dataValues.totalRating,data:ratingData,catData:cdata});



      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(adminpath+"ratings");
      }


});

app.post('/company/delete',adminAuth,async(req,res,next) => { 
  
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



app.get('/staff/',adminAuth, async (req, res, next) => {
    
  var params=req.query
    try {
      var dataRating=null
      if(params.id && params.id!="")
      var dataRating= await commonMethods.getEmpAvgRating(params.id)
  
          var total =0
          var avgRating =0
  
          if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) avgRating=dataRating.dataValues.totalRating
          if(dataRating && dataRating.dataValues && dataRating.dataValues.totalNoRating) total=dataRating.dataValues.totalNoRating
  
          var  permissions =await PERMISSIONS.findOne({where:{companyId:req.id}})

return res.render('admin/ratings/staffRatings.ejs',{total:total,avgRating,permissions});
      } catch (e) {
       return responseHelper.error(res, e.message, 400);
     
      }


});

app.post('/staff/ratings',adminAuth, async (req, res, next) => {
    
  var params=req.body
  

   var page =1
   var limit =20
   var orderby='createdAt'
   var orderType='ASC'
    var fromDate=""
    var toDate=""
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }


  if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
  if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())


  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {
    companyId:req.id
    
    }

    
    if(fromDate!="" && toDate!="")
    {
      where= {
        companyId:req.id,
        ratingOn: { [Op.gte]: fromDate,[Op.lte]: toDate},
      }
    }
    


    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {review: {[Op.like]: `%${params.search}%`}},
        {rating: { [Op.like]: `%${params.search}%` }}
      
      ],
      companyId:req.id

    }

  }
    
  
  if(params.empId&& params.empId!="")
where.empId=params.empId

      try{
      
    

        var ratingData = await STAFFRATINGS.findAndCountAll({
          attributes: ['id','rating','review','empId','orderId','orderId','createdAt'],
      
          where: where
    
          ,
          include: [
            {
            model: USERS,
            attributes: ['id','firstName','lastName','image'],
            required: false
            },

            {
              model: EMPLOYEE,
              attributes: ['id','firstName','lastName','image'],
              required: true
              },
    {
            model: ORDERS,
            attributes: ['id','orderNo'],
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

app.post('/staff/delete',adminAuth,async(req,res,next) => { 
  
  var params=req.body
  var id=params.id

  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  
    return responseHelper.error(res, appstrings.required_field,400);

    await STAFFRATINGS.destroy({where:{id: id}});


   
    return responseHelper.post(res, appstrings.delete_success,null);




    } catch (e) {
      return responseHelper.error(res, e.message,400);
    }


 
});

app.get('/companyorder/', adminAuth, async (req, res, next) => {

  var params = req.query
  try {
    var permissions = await PERMISSIONS.findOne({ where: { companyId: req.id } })

    return res.render('admin/ratings/companyOrderRatings.ejs', { permissions });
  } catch (e) {
    return responseHelper.error(res, e.message, 400);

  }


});

app.post('/companyorder/getData', adminAuth, async (req, res, next) => {

  var params = req.body
  var page = 1
  var limit = 20
  var orderby = 'createdAt'
  var orderType = 'ASC'
  var fromDate = ""
  var toDate = ""
  if (params.orderByInfo && params.orderByInfo.orderby) {
    orderby = params.orderByInfo.orderby
    orderType = params.orderByInfo.orderType

  }

  if (params.fromDate) fromDate = Math.round(new Date(params.fromDate).getTime())
  if (params.toDate) toDate = Math.round(new Date(params.toDate).getTime())

  if (params.page) page = params.page

  if (params.limit)
    limit = parseInt(params.limit)
  var offset = (page - 1) * limit

  var where = {
    companyId: req.id,
    orderId: { [Op.or]:[{[Op.ne]: "", [Op.ne]: null}]  },
  }

  if (fromDate != "" && toDate != "") {
    where = {
      companyId: req.id,
      orderId: { [Op.or]:[{[Op.ne]: "", [Op.ne]: null}]  },
      createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate },
    }
  }
  if (params.search && params.search != "") {

    where = {
      [Op.or]: [
        { review: { [Op.like]: `%${params.search}%` } },
        { rating: { [Op.like]: `%${params.search}%` } }

      ],
      companyId: req.id,
      orderId: { [Op.or]:[{[Op.ne]: "", [Op.ne]: null}]  },
    }

  }
  try {

    var ratingData = await COMPANYRATING.findAndCountAll({
      where: where,
      include: [
        {
          model: USERS,
          attributes: ['id', 'firstName', 'lastName', 'image'],
          required: false
        },

        {
          model: ORDERS,
          attributes: ['id', 'orderNo'],
          required: false
        },
      ],
      order: [[orderby, orderType]],
      distinct: true,
      offset: offset, limit: limit,

    })
    var rd = JSON.parse(JSON.stringify(ratingData));
    for (var h = 0; h < rd.rows.length; h++) {
      var serviceRatingData = await SERVICERATINGS.findAll({
        attributes: ['id', 'rating', 'review', 'serviceId', 'orderId', 'createdAt'],
        where: {orderId: rd.rows[h].orderId},
        include:{
          model: SERVICES,
          attributes: ['name'],
          required: false
        }   
      })
      rd.rows[h]['serviceData'] = serviceRatingData;
    }
// console.log("==========",JSON.parse(JSON.stringify(rd)))
    var data = {}
    data.ratingData = rd;

    var rating = 0;
    var packingPres = 0
    var foodQuality = 0
    var foodQuantity = 0
    var dataRating = await commonMethods.getCompAvgRating(req.id)
    if (dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) { rating = dataRating.dataValues.totalRating }
    foodQuality = dataRating.dataValues.foodQuality
    packingPres = dataRating.dataValues.packingPres
    foodQuantity = dataRating.dataValues.foodQuantity
    data.avgRating = rating
    data.foodQuality = foodQuality
    data.packingPres = packingPres
    data.foodQuantity = foodQuantity
    return responseHelper.post(res, appstrings.message, data);

  } catch (e) {
    console.log("====error", e)
    return responseHelper.error(res, e.message, 400);
  }

});

app.post('/products/delete',adminAuth,async(req,res,next) => { 
  
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
