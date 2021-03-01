
const express = require('express');
const app     = express();



app.get('/',superAuth, async (req, res, next) => {
    
    try {
        const findData = await BANNER.findAll({
        where :{companyId :req.companyId},
        order: [
          ['orderby','ASC']
        ],      

        });
        return res.render('super/banner/bannerListing.ejs',{data:findData});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await BANNER.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await BANNER.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, params.status==0?"Banner "+appstrings.active_success:"Banner "+appstrings.inactive_success,updatedResponse);
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


app.get('/add',superAuth, async (req, res, next) => {
    
  try{
  
    return res.render('super/banner/addBanner.ejs',);

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/addBanner',superAuth,async (req, res) => {
  try {
    const data = req.body;
   var bannerImage=""

    let responseNull= commonMethods.checkParameterMissing([data.name])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

    if (req.files) {

      ImageFile = req.files.banner;    
      if(ImageFile)
      {
        bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"banners/"+ bannerImage, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.meessage, 400);   
        });
  }
    
      }


    const user = await BANNER.findOne({
      where: {
        name: data.name,

      }
    });



    if (!user) {
      
      const users = await BANNER.create({
        name: data.name,
        url: bannerImage,
        orderby: data.order,
        companyId:req.companyId

       });


      if (users) {

        responseHelper.post(res, appstrings.added_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})


app.post('/update',superAuth,async (req, res) => {
  try {
    const data = req.body;
    var bannerImage=""


    let responseNull= commonMethods.checkParameterMissing([data.name,data.bannerId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    if (req.files) {

      ImageFile = req.files.banner;    
      if(ImageFile)
      {
        bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"banners/"+ bannerImage, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.meessage, 400);   
        });
  }
    
      }


    const user = await BANNER.findOne({
      where: {
        id:data.bannerId,

      }
    });



    if (user) {
      
    if(bannerImage=="") bannerImage=user.dataValues.url
      const users = await BANNER.update({
        name: data.name,
        url: bannerImage,
        orderby: data.order,
        companyId:req.companyId


       },

      { where:
       {
id: data.bannerId,
companyId: req.companyId
       }
      }
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.post(res, appstrings.no_record, 204);

    

  } catch (e) {
    return responseHelper.error(res, e.message, null);
  }

})



app.get('/view/:id',superAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"banner");
}


   
      const findData = await BANNER.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   
      return res.render('super/banner/viewBanner.ejs',{data:findData});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"banner");
    }


 
});



app.get('/delete/:id',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"banner");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await BANNER.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(superadminpath+"banner");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(superadminpath+"banner");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(superadminpath+"banner");
        }
});




module.exports = app;

//Edit User Profile
