
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

const COUPAN = db.models.coupan
const CATEGORY = db.models.categories
var moment = require('moment')




app.get('/',adminAuth, async (req, res, next) => {
    
  try{
   
    
    
   
        return res.render('admin/gallery/galleryListing.ejs');

      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/list',adminAuth, async (req, res, next) => {
  try {
  
    var params=req.body

 
    var page =1
    var limit =20
    var mediaType=""
    var orderby='createdAt'
    var orderType='ASC'
    var status=['0','1']

    if(params.orderByInfo &&   params.orderByInfo.orderby) {
     orderby=params.orderByInfo.orderby
     orderType=params.orderByInfo.orderType
 
   }

 
   if(params.mediaType) mediaType=params.mediaType
 
   if(params.page) page=params.page
 
   if(params.limit)
    limit=parseInt(params.limit)
    var offset=(page-1)*limit
 




    var where= {
      companyId:req.id,
      status:  {[Op.or]: status}

      } 
     
 
 
     if(params.search && params.search!="")
     {
 
      where={ [Op.or]: [
         {title: {[Op.like]: `%${params.search}%`}},
         {description: { [Op.like]: `%${params.search}%` }},
       ],
       companyId:req.id,
       status:  {[Op.or]: status}

     }
 
   }
     
   if(mediaType!="")
   where.mediaType=mediaType


      var findData = await GALLERY.findAndCountAll({
        where :where,
        offset: offset, limit: limit ,
        order: [[orderby,orderType]]

      });
  
    return responseHelper.post(res, appstrings.success, findData);
  

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }
});


app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
    var cdata= await commonMethods.getAllCategories(req.companyId)
    var types=await commonMethods.getUserTypes(req.parentCompany) 

    return res.render('admin/gallery/addGallery.ejs',{catData:cdata,types:types});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/status',adminAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await GALLERY.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await GALLERY.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res,   params.status==0?"Gallery Item "+appstrings.approve_success:"Gallery Item "+appstrings.inapprove_success,updatedResponse);
             }
             else{
               return responseHelper.post(res, 'Something went Wrong',null,400);
    
             }
       
       }

       else{
        return responseHelper.post(res, appstrings.no_record,null,204);

      }

         }
           catch (e) {
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
});


app.post('/add',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.title,data.description,data.mediaType])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var media=""


    if (req.files) {

      ImageFile = req.files.media;    
      if(ImageFile)
      {
        media = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"gallery/"+ media, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.meessage, 400);   
      });

    }
    
      }


    const user = await GALLERY.findOne({
      attributes: ['id'],

      where: {
        title: data.title,
      }
    });



    if (!user) {
    
      const users = await GALLERY.create({
        title: data.title,
        description: data.description,
        mediaType: data.mediaType,
        mediaUrl: media,
        mediaHttpUrl:media,
        companyId:req.id,
        status:1
       });


      if (users) {

        responseHelper.post(res, appstrings.added_success, null,200);
       
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


    let responseNull= commonMethods.checkParameterMissing([data.title,data.description, data.galleryId,data.mediaType])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var media=""

    if (req.files) {

        ImageFile = req.files.media;    
        if(ImageFile)
        {
          media = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

        ImageFile.mv(config.UPLOAD_DIRECTORY +"gallery/"+ media, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.meessage, 400);   
        });

      }
    
    }


    const user = await GALLERY.findOne({
      attributes: ['id'],
      where: {
        id: data.galleryId,

      }
    });




    if (user) {
    
      if(media=="") media=user.dataValues.mediaUrl


      const users = await GALLERY.update({
        title: data.title,
        description: data.description,
        mediaType: data.mediaType,
        mediaUrl: media,
        mediaHttpUrl:media,
        companyId:req.id,
        status:1
       },
       {where:{
        id: data.galleryId
       }}
       
       
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
   // console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})


app.post('/delete',adminAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.body.id])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await GALLERY.destroy({
          where: {
            id: req.body.id
          }
          })  
            
          if(numAffectedRows>0)
          {
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



app.get('/view/:id',adminAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"gallery/");
}
      var findData = await GALLERY.findOne({
      where :{companyId :req.companyId, id: id }
      

  
      });

  
      if(findData) 
      
      return res.render('admin/gallery/viewGallery.ejs',{data:findData});
      


      else   return res.redirect(adminpath+"gallery/");

      


    } catch (e) {
      console.log(e)
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"gallery/");
    }


 
});






module.exports = app;

//Edit User Profile
