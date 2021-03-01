const express = require('express');
const app = express();
const Op = require('sequelize').Op;
var _=require('underscore')
const fs = require('fs');
var path = require("path");
const db = require('../../../db/db');

//Relations

RECIPES.belongsTo(COMPANY,{foreignKey: 'companyId'})
RECIPES.hasMany(RECMEDIA,{foreignKey: 'recipeId'})
RECIPES.belongsTo(RECCAT,{foreignKey: 'categoryId'})

//Home API with cats and trending and banners



app.post('/home', checkAuth,async (req, res, next) => {

  var params=req.body
  
   var lat=0
   var lng=0
   var page =1
   var limit =20
   var orderby='createdAt'
   var orderType='DESC'

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

   var where= {status:1}

    
    if(params.search && params.search!="")
    
    where={
      status:1,
      [Op.or]: [
      { 'title': { [Op.like]: '%' + params.search + '%' }},
      { 'description': { [Op.like]: '%' + params.search + '%' }},
      { 'tags': { [Op.like]: '%' + params.search + '%' }}
    ]}

  

      


    try{


      var services = await RECIPES.findAll({
        attributes: ['id','title','description','tags','totalRatings','rating','views','createdAt'],
        where: where,
        include: [{model:RECMEDIA,
        attributes:['id','mediaType','mediaUrl'],
      },
      {model:RELIKE ,attributes:['recipeId']}

    
    ],
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

 let responseNull=  common.checkParameterMissing([params.recipeId])
  if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);

  try{

    var services = await RECIPES.findOne({
      attributes: ['id','categoryId','title','description','tags','totalRatings','rating','views','createdAt'],
      where: {id:params.recipeId},
      include: [{model:RECMEDIA,
      attributes:['id','mediaType','mediaUrl'],
    }]
    })


    if(services)
    
    return responseHelper.post(res, appstrings.detail, services);

  
    else
    return responseHelper.post(res, appstrings.no_record, null,204);


  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});



app.get('/categories', checkAuth,async (req, res, next) => {

 

    try{

      var services = await RECCAT.findAll({
        attributes: ['id','name'],
        where: {status:1}
  
      })


      if(services.length>0)
      

      return responseHelper.post(res, appstrings.detail, services);

    
      else
      return responseHelper.post(res, appstrings.no_record, null,204);


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});

app.post('/category/add', checkAuth,async (req, res) => {

  var params=req.body
  let responseNull=  common.checkParameterMissing([params.name])
  if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);

  try{

    var services = await RECCAT.findOne({
      attributes: ['id','name'],
      where: { name:{[Op.like]: '%' + params.name + '%'} }

    })


    if(!services)
  {

    var services = await RECCAT.create({name:params.name})
  }
    return responseHelper.post(res, appstrings.ad, services);


  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});

app.post('/add', checkAuth,async (req, res) => {

  var params=req.body
  console.log(params)
  let responseNull=  common.checkParameterMissing([params.tempId,params.title,params.description,params.categoryId])
  if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);


  var media=params.media
  if(typeof media)
  if(typeof media !='object' )
  return responseHelper.error(res, appstrings.required_field, 400);

  try{

    var services = await RECIPES.findOne({
      attributes: ['id','title'],
      where: { id:params.tempId }

    })


    if(services)
  {
    return responseHelper.post(res, appstrings.already_exists, null,400);

  }
  else{

   var addData=await RECIPES.create({
     id:params.tempId,
     title:params.title,
     description:params.description,
     userId:req.id,
     categoryId:params.categoryId,
     tags:params.tags,
     latitude:params.latitude,
     longitude:params.longitude


  })
  

  
  var findData=  await RECMEDIA.findAll({
    attributes:['id','mediaUrl'],
    where:{
    recipeId:params.tempId,
     id:{[Op.notIn]:media}
  }})

 
RECMEDIA.destroy({where:{
  recipeId:params.tempId,
   id:{[Op.notIn]:media}

}})

for(var k=0;k<findData.length;k++)
{
  var name=path.basename(findData[k].mediaUrl)
  console.log(findData[k].mediaUrl,"name....",name)

  fs.unlink(config.UPLOAD_DIRECTORY +"recipes/"+name,function(err){
    if(err)  console.log(err);
    console.log('file deleted successfully');
  }); 




}





    return responseHelper.post(res, appstrings.recipe_add, addData);
  }

    


  }
  catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }

});

app.post('/mediaUpload', checkAuth,async (req, res) => {

  var params=req.body
  console.log(params)
  var mediaUrl=""
  let responseNull=  common.checkParameterMissing([params.mediaType,params.tempId])
  if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);


  if (req.files) {
    var ImageFile = req.files.media;    
    mediaUrl = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
    ImageFile.mv(config.UPLOAD_DIRECTORY +"recipes/"+ mediaUrl, function (err) {
        //upload file
        if (err)
        {console.log(err)
        responseHelper.error(res,err.message,400)}
       // return res.json(jsonResponses.response(0, err.message, null));
    });
    }

if(mediaUrl=="")
return responseHelper.post(res, appstrings.no_meadia, null,400);


  try{

  
   var dataAdded=await RECMEDIA.create({
     mediaType:params.mediaType,
     mediaUrl:mediaUrl,
     recipeId:params.tempId,
     userId:req.id
  })
  
    return responseHelper.post(res, appstrings.media_add, dataAdded);
  }

  
  
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});
module.exports = app;