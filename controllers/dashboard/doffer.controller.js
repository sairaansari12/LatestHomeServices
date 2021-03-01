
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

const COUPANs = db.models.coupan
const CATEGORYs = db.models.categories
const moment = require('moment');
const { companyId } = require('../../helpers/common');



app.get('/',adminAuth, async (req, res, next) => {
    
  try{
   
    var newDate = moment(new Date()).format("YYYY-MM-DD");
    const findData = await COUPAN.findOne({
      where: {
        companyId: req.companyId,
        offerType: "overall",
        validupto: {
          [Op.gte] : newDate
        }
      },
      include:[ {
        model: USERTYPE,
        attributes: ['id','userType'],
        required: false
      }],
    });
    
        return res.render('admin/offers/offerListing.ejs',{data:findData});

      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
    var cdata = await commonMethods.getAllowedCategories(req.parentCompany,req.id,req.role)
    var types=await commonMethods.getUserTypes(req.parentCompany) 

    return res.render('admin/offers/addOffer.ejs',{catData:cdata,types:types});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/status',adminAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await COUPAN.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await COUPAN.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res,   params.status==0?"Offer "+appstrings.active_success:"Offer "+appstrings.inactive_success,updatedResponse);
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


    let responseNull= commonMethods.checkParameterMissing([data.minimumAmount,data.name,data.code,data.discount,data.validupto])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"coupans/thumbnails/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.meessage, 400);   
      });

    }
    //   ImageFile1 = req.files.thumbnail;    
    //   if(ImageFile1)
    //   {
    //   thumbnail = Date.now() + '_' + ImageFile1.name;
    //   ImageFile1.mv(config.UPLOAD_DIRECTORY +"coupans/thumbnails/"+ thumbnail, function (err) {
    //       //upload file
    //       if (err)
    //       return responseHelper.error(res, err.message, 400);   
    //   });
    // }
      }


    const user = await COUPAN.findOne({
      attributes: ['id'],

      where: {
        code: data.code,
      }
    });



    if (!user) {
    



      const users = await COUPAN.create({
        name: data.name,
        offerType: "overall",
        usageLimit: data.usageLimit,
        code: data.code,
        discount: data.discount,
        icon: icon,
        type:data.type,
        validupto:data.validupto,
        thumbnail: icon,
        description:data.description,
        companyId: req.companyId,
        minimumAmount:data.minimumAmount

       });


      if (users) {

        COMPANY.update({offer:users.id},{where:{id:req.id}})

        responseHelper.post(res, appstrings.add_offer, null,200);
       
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


    let responseNull= commonMethods.checkParameterMissing([data.minimumAmount,data.validupto, data.coupanId,data.name,data.code,data.discount])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""

    if (req.files) {

        ImageFile = req.files.icon;    
        if(ImageFile)
        {
           icon = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

        ImageFile.mv(config.UPLOAD_DIRECTORY +"coupans/thumbnails/"+ icon, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.meessage, 400);   
        });

      }
    
    }


    const user = await COUPAN.findOne({
      attributes: ['id'],

      where: {
        id: data.coupanId,
        companyId: req.companyId

      }
    });




    if (user) {
    
      if(icon=="") icon=user.dataValues.icon


      const users = await COUPAN.update({
        name: data.name,
        code: data.code,
        discount: data.discount,
        icon: icon,
        usageLimit: data.usageLimit,
        thumbnail: icon,
        type:data.type,
        description:data.description,
        companyId: req.companyId,
        validupto:data.validupto,
        minimumAmount:data.minimumAmount
       },
       {where:{
        id: data.coupanId
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









app.get('/view/:id',adminAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"offers");
}


   
      const findData = await COUPAN.findOne({
      where :{companyId :req.companyId, id: id }
      });
   
      var cdata = await commonMethods.getAllowedCategories(req.parentCompany,req.id,req.role)
      var types=await commonMethods.getUserTypes(req.parentCompany) 

      return res.render('admin/offers/viewOffer.ejs',{data:findData,catData:cdata,types:types});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"offers");
    }


 
});



app.get('/delete/:id',adminAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"offers");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await COUPAN.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(adminpath+"offers");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(adminpath+"offers");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(adminpath+"offers");
        }
});




module.exports = app;

//Edit User Profile
