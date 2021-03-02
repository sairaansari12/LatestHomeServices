
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;




 
app.get('/',adminAuth, async (req, res, next) => {
  try {
    
    var  permissions =await PERMISSIONS.findOne({where:{companyId:req.id}})
    var pdata= await commonMethods.getAllowedCategories(req.parentCompany,req.id,req.role)

     return res.render('admin/products/addOnsListing.ejs',{permissions,catData:pdata});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});
app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
    var cdata= await commonMethods.getAllCategories(req.companyId)
    var pdata= await commonMethods.getAllowedCategories(req.parentCompany,req.id,req.role)

    return res.render('admin/products/addAddOn.ejs',{catData:cdata,parData: pdata});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});   
  
app.get('/view/:id',adminAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"addons/");
}
      var findData = await SERVICES.findOne({
      where :{companyId :req.companyId, id: id },
      include:[{model:FILTERS,attributes:['id','filter']}]


  
      });

    if(findData) {
      var  permissions =await PERMISSIONS.findOne({where:{companyId:req.id}})

      return res.render('admin/products/viewAddon.ejs',{data:findData,permissions});
      }


        return res.redirect(adminpath+"addons/");

      


    } catch (e) {
      console.log(e)
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"products/");
    }


 
});


app.get('/edit/:id',adminAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"addons/");
}
      var findData = await SERVICES.findOne({
      where :{companyId :req.companyId, id: id }
     

  
      });
      var pdata= await commonMethods.getAllowedCategories(req.parentCompany,req.id,req.role)


      return res.render('admin/products/editAddOn.ejs',{data:findData,pdata});
      



      


    } catch (e) {
      console.log(e)
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"addons/");
    }


 
});



app.post('/list',adminAuth,async (req, res, next) => {

  var params=req.body
  
   var lat=0
   var lng=0
   var page =1
   var limit =20
   var itemType=[]
   var orderby='createdAt'
   var orderType='ASC'
   var category=''

   if(params.itemType && params.itemType!="") itemType=[params.itemType]
   if(params.lat) lat=parseFloat(params.lat)
   if(params.lng) lng=parseInt(params.lng)
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }

  if(params.category) category=params.category

  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {
    companyId:req.companyId,
    productType:2,
    deleted:0,
    itemType:  {[Op.or]: itemType}
    
    }

    


    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {name: {[Op.like]: `%${params.search}%`}},
        {description: { [Op.like]: `%${params.search}%` }},
        {price: { [Op.like]: `%${params.search}%` }
      }
      ],
      companyId: req.companyId,
      productType:2,
      deleted:0,
      itemType:  {[Op.or]: itemType}
    }

  }
    
  

      


    try{



      var services = await SERVICES.findAndCountAll({
        where: where,
        distinct:true,     
      order: [[orderby,orderType]],
      include:[{model:CATEGORY,as:'category',
        attributes:['id'],
        where:{[Op.or]:[
          
          {connectedCat : {[Op.like]: '%' + category + '%'}},
          {id : {[Op.like]: '%' + category + '%'}}
    
    ]}},
  
    {model:FILTERS,attributes:['id','filter']},
  
  ],
      offset:offset,limit:limit,

      })


      var filters=[]
      if(category!="")
       filters=getFilters=await commonMethods.getFilters(req.parentCompany,category)


      return responseHelper.post(res, appstrings.success, {services,filters});

  

    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});
app.post('/list1',adminAuth,async (req, res, next) => {

  var params=req.body
  
   var lat=0
   var lng=0
   var page =1
   var limit =20
   var itemType=[]
   var orderby='createdAt'
   var orderType='ASC'
   var category=''

   if(params.itemType && params.itemType!="") itemType=[params.itemType]
   if(params.lat) lat=parseFloat(params.lat)
   if(params.lng) lng=parseInt(params.lng)
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }

  if(params.category) category=params.category

  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {
    companyId:req.companyId,
    productType:2,
    deleted:0,
    itemType:  {[Op.or]: itemType}
    
    }

    


    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {name: {[Op.like]: `%${params.search}%`}},
        {description: { [Op.like]: `%${params.search}%` }},
        {price: { [Op.like]: `%${params.search}%` }
      }
      ],
      companyId: req.companyId,
      productType:2,
      deleted:0,
      itemType:  {[Op.or]: itemType}
    }

  }
    
  var catArray=[]

  if(category!="")
  {
  var catId=await CATEGORY.findAll({where:{[Op.or]:[
          
    {connectedCat : {[Op.like]: '%' + category + '%'}},
    {id : {[Op.like]: '%' + category + '%'}}

]}})


if(catId.length>0) catArray=catId.map(user => user.parentId);

  }

    try{







      var services = await SERVICES.findAndCountAll({
        where: where,
        distinct:true,     
      order: [[orderby,orderType]],
      include:[{model:CATEGORY,as:'category',
        attributes:['id'],
        where:{
          
       
          id : catArray
    
    }},
  
    {model:FILTERS,attributes:['id','filter']},
  
  ],
      offset:offset,limit:limit,

      })


      var filters=[]
      if(category!="")
       filters=getFilters=await commonMethods.getFilters(req.parentCompany,category)


      return responseHelper.post(res, appstrings.success, {services,filters});

  

    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});



app.post('/add',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.serviceName,data.category,data.originalPrice,data.price])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var thumbnail=""

    if (req.files) {
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name.replace(/\s/g, "");
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await SERVICES.findOne({
      attributes: ['id'],

      where: {
        name: data.serviceName,
        companyId: req.companyId

      }
    });



    if (!user) {
      var validUpto=null
      var offer=0

      if(data.validUpto && data.validUpto!="") validUpto=data.vaidUpto
      if(data.offer && data.offer!="") offer=data.offer

      const users = await SERVICES.create({
        name: data.serviceName,
        description: data.description,
        itemType: data.itemtype,
        price: data.price,
        icon: thumbnail,
        thumbnail: thumbnail,
        companyId: req.companyId,
        originalPrice :data.originalPrice,
        productType:2,
        categoryId:data.category


       });


      if (users) {

        responseHelper.post(res, appstrings.add_service, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})


app.post('/update',adminAuth,async (req, res) => {
  try {
    const data = req.body;

    console.log(data)

    let responseNull= commonMethods.checkParameterMissing([data.category,data.serviceId,data.serviceName,data.price])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var thumbnail=""

    if (req.files) {

      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name.replace(/\s/g, "");
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await SERVICES.findOne({
      attributes: ['id'],

      where: {
        id: data.serviceId,
        companyId: req.companyId

      }
    });




    if (user) {
    
      if(thumbnail=="") thumbnail=user.dataValues.thumbnail

      
      const users = await SERVICES.update({
        name: data.serviceName,
        description: data.description,
        itemType: data.itemtype?data.itemtype:"",
        price: data.price,
        icon: thumbnail,
        thumbnail: thumbnail,
        categoryId:data.category,
        originalPrice :data.originalPrice

       },
       {where:{

        id: data.serviceId
       }}
       
       
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})





app.post('/delete',adminAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.body.id])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await SERVICES.update({
        
          deleted:1},
         { where: {
            id: req.body.id
          }
          })  
            
          if(numAffectedRows)
          {
            await CART.destroy({where:{serviceId:req.body.id}})

          // req.flash('successMessage',appstrings.delete_success)
         return responseHelper.post(res, appstrings.delete_success,null,200);
        }

          else {
            return responseHelper.post(res, appstrings.no_record,null,400);
           // return res.redirect(adminpath+"category");
          }

        }catch (e) {
          return responseHelper.error(res, e.message, 400);
          //req.flash('errorMessage',appstrings.no_record)
          //return res.redirect(adminpath+"category");
        }
});



app.post('/status',adminAuth,async(req,res,next) => { 
    
  var params=req.body
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     
  
     const userData = await SERVICES.findOne({
       where: {
         id: params.id }
     });
     
     
     if(userData)
     {
     

  var status=0
  if(params.status=="0")  status=1
     const updatedResponse = await SERVICES.update({
       status: status,
  
     },
     {
       where : {
       id: userData.dataValues.id
     }
     });
     
     if(updatedResponse)
           {
  
         return responseHelper.post(res, params.status==0?"Product item "+appstrings.active_success:"Product item "+appstrings.inactive_success ,updatedResponse);
           }
           else{
             return responseHelper.post(res, 'Something went Wrong',400);
  
           }
     
     }

     else{
      return responseHelper.post(res, appstrings.no_record,204);

    }

       }
         catch (e) {
           console.log(e)
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});


app.post('/getFilters',adminAuth,async(req,res,next) => { 
    
  var params=req.body
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.category])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     
  
     const userData = await commonMethods.getFilters(req.parentCompany,params.category)
     
  
      return responseHelper.post(res, appstrings.success,userData,200);

    

       }
         catch (e) {
           console.log(e)
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});




module.exports = app;

//Edit User Profile
