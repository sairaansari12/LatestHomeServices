
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

const SERVICES = db.models.services
const FAVOURITES = db.models.favourites



app.get('/list',adminAuth, async (req, res, next) => {
    
  var parentId = req.query.id
  var name = req.query.name

  try{
    let responseNull=  commonMethods.checkParameterMissing([parentId])
    if(responseNull) 
  {
    req.flash('errorMessage',appstrings.required_field)
    return res.redirect(adminpath+"subservice");   
  }
   
      const servicesData = await SERVICES.findAll({
        attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','turnaroundTime','includedServices','excludedServices','createdAt','status','parentId'],
        where: {
          companyId: req.companyId,
          parentId :  parentId
          ,
          id:  {[Op.not]: '0'},
      
               },
               include:[ {
                model: SERVICES,
                as: 'category',
                attributes: ['name','icon','thumbnail'],
                required: true
              }],
              
        order: [
          ['orderby','ASC']
        ],
      });
     

      
        return res.render('admin/subservice/subServices.ejs',{data:servicesData,id:parentId,name: name});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
    return res.render('admin/subservice/addSubService.ejs');

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
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
    
           return responseHelper.post(res, appstrings.success,updatedResponse);
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


    let responseNull= commonMethods.checkParameterMissing([data.parentId,data.serviceName,data.type,data.duration,data.price])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"services/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
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
    
      const users = await SERVICES.create({
        name: data.serviceName,
        description: data.description,
        type: data.type,
        price: data.price,
        duration: data.duration,
        icon: icon,
        thumbnail: thumbnail,
        includedServices:data.includedServices,
        excludedServices:data.excludedServices,
        companyId: req.companyId,
        parentId :data.parentId

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


    let responseNull= commonMethods.checkParameterMissing([data.parentId,data.serviceId,data.serviceName,data.type,data.duration,data.price])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"services/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
    
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
    
      if(icon=="") icon=user.dataValues.icon
      if(thumbnail=="") thumbnail=user.dataValues.thumbnail


      const users = await SERVICES.update({
        name: data.serviceName,
        description: data.description,
        type: data.type,
        price: data.price,
        duration: data.duration,
        icon: icon,
        thumbnail: thumbnail,
        includedServices:data.includedServices,
        excludedServices:data.excludedServices,
        companyId: req.companyId,
        parentId :data.parentId

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









app.get('/view',adminAuth,async(req,res,next) => { 
  
  var id=req.query.id
  var parent=req.query.parent
  var name=req.query.name

  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"subservice/list?id="+parent+"&name="+name);
}
      const findData = await SERVICES.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   
      return res.render('admin/subservice/viewSubService.ejs',{data:findData});



    } catch (e) {
      
      req.flash('errorMessage',appstrings.no_record)
      return res.redirect(adminpath+"subservice/view?id="+id+"&parent="+parent+"&name="+name);
    }


 
});



app.get('/delete',adminAuth,async(req,res,next) => { 
   var id=req.query.id
   var parent=req.query.parent
   var name=req.query.name

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"subservice/list?id="+parent+"&name="+name);
}

  try{

  
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await SERVICES.destroy({
          where: {
            id: id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(adminpath+"subservice/list?id="+parent+"&name="+name);

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(adminpath+"subservice/list?id="+parent+"&name="+name);
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(adminpath+"subservice/list?id="+parent+"&name="+name);
        }
});




module.exports = app;

//Edit User Profile
