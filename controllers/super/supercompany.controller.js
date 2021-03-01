
const express = require('express');
const app     = express();
const hashPassword = require('../../helpers/hashPassword');
const Op = require('sequelize').Op;



app.get('/',superAuth, async (req, res, next) => {
    
    try {
        // const findData = await COMPANY.findAll({
        // where :{parentId :req.id},
        // order: [
        //   ['companyName','ASC']
        // ],      

        // });
        return res.render('super/company/companyListing.ejs');



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await COMPANY.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await COMPANY.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, params.status==0?"Retaurant "+appstrings.active_success:"Restaurant "+appstrings.inactive_success,updatedResponse);
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
  
    return res.render('super/company/addCompany.ejs',);

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.get('/compare',superAuth, async (req, res, next) => {
    
  try{
  
    return res.render('super/company/compare.ejs',);

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});


app.get('/permissions',superAuth, async (req, res, next) => {
    
  var params=req.query
  try{
  
    const permissions = await PERMISSIONS.findOne({
      where: {
        companyId: params.id }
    });

    const pcategories = await CATEGORY.findAll({
      where: {
        companyId: req.id,
      level:0 }
    });


    return res.render('super/company/permissions.ejs',{permissions,pCategories:pcategories});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});


app.post('/permissions',superAuth,async (req, res) => {
  try {
   
    var data=req.body

    console.log(data)

    const user = await PERMISSIONS.findOne({
      where :{companyId :data.companyId }
    });

    var pCategories=data.pCategory
    var catArray=pCategories
     if(typeof pCategories=="string" && pCategories!="") 
      catArray=[pCategories]

    if (user) {




  //console.log(catArray)
    
      //update Record
      const users = await PERMISSIONS.update({
          productReviewDelete: data.pReviewDelete=="on"?"1":"0",
          staffReviewDelete: data.sReviewDelete=="on"?"1":"0",
          restroReviewDelete: data.rReviewDelete=="on"?"1":"0",
          pApproved: data.pApproved=="on"?"1":"0",
          pCategories:pCategories?JSON.stringify(catArray):null
        },
        {
          where :{companyId :data.companyId }
        }
      );
     
      if(users)responseHelper.post(res, appstrings.update_success,null, 200);

       else responseHelper.error(res, appstrings.oops_something, 400);
    }
else{
  const users = await PERMISSIONS.create({
    productReviewDelete: data.pReviewDelete=="on"?"1":"0",
    staffReviewDelete: data.sReviewDelete=="on"?"1":"0",
    restroReviewDelete: data.rReviewDelete=="on"?"1":"0",
    pApproved: data.pApproved=="on"?"1":"0",
    pCategories:pCategories?JSON.stringify(catArray):null,
    companyId:data.companyId
  } 
);

responseHelper.post(res, appstrings.update_success,null, 200);
}

  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})



app.post('/list',superAuth,async (req, res, next) => {

  var params=req.body
  
   var page =1
   var limit =20
   var status=['0','1']
   var orderby='createdAt'
   var orderType='ASC'

   if(params.status && params.status!="") status=[params.status]
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }


  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {
    parentId:req.id,
    status:  {[Op.or]: status}    
    }

 


    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {companyName: {[Op.like]: `%${params.search}%`}},
        {address1: { [Op.like]: `%${params.search}%` }},
        {email: { [Op.like]: `%${params.search}%` }},
        {phoneNumber: { [Op.like]: `%${params.search}%` }},
        {countryCode: { [Op.like]: `%${params.search}%` }}


      ],
      parentId: req.id,
      status:  {[Op.or]: status},
    }

  }
    
  

      


    try{


      var services = await COMPANY.findAndCountAll({
      where: where,
      order: [[orderby,orderType]],
      offset:offset,limit:limit,

      })



      return responseHelper.post(res, appstrings.success, services);

  

    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});




app.post('/add',superAuth,async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    var logo1 = "";
    var logo2 = "";
    var logo3 = "";


    let responseNull= commonMethods.checkParameterMissing([data.companyName,data.email,data.address,data.phoneNumber,data.password,data.chargesType])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

    const newPassword = await hashPassword.generatePass(data.password);

  
    //Uploading Comapny Images
    if (req.files) {
      var ImageFile = req.files.logo1;
      if(ImageFile)
      {
        logo1 = Date.now() + '_' + ImageFile.name;
          ImageFile.mv(config.UPLOAD_DIRECTORY +"users/"+ logo1, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
      var ImageFile2 = req.files.logo2;
      if(ImageFile2)
      {
          logo2 = Date.now() + '_' + ImageFile2.name;
          ImageFile2.mv(config.UPLOAD_DIRECTORY +"users/"+ logo2, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
      var ImageFile3 = req.files.logo3;
      if(ImageFile3)
      {
        logo3 = Date.now() + '_' + ImageFile3.name;
        ImageFile3.mv(config.UPLOAD_DIRECTORY +"users/"+ logo3, function (err) {
          //upload file
          if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
    }
    const user = await COMPANY.findOne({
      where :{ [Op.or]: [
        {companyName: data.companyName},
        {email:  data.email},
        {phoneNumber: data.phoneNumber}
      ]}
    });
    if (!user) {
      //update Record
      const users = await COMPANY.create({
        companyName: data.companyName,
        email: data.email,
        address1: data.address,
        websiteLink: data.websiteLink,
        logo1:logo1,
        logo2:logo2,
        logo3:logo3,
        password:newPassword,
        parentId: req.id,
        tags: '',
        itemType:data.itemType,
        deliveryType:data.deliveryType,
        startTime:data.startTime,
        endTime:data.endTime,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        latitude: data.latitude,
        longitude: data.longitude,
      });

if(users)
{
COMISSION.create({
  companyId:users.id,
  chargesPercent:data.charges,
  chargesAmount:data.fullAmount,
  chargesType:data.chargesType,
  installments:data.installments
})

PERMISSIONS.create({
  companyId:users.id
})




}

      return responseHelper.post(res, appstrings.company_add, null,200);
    }
      else  responseHelper.post(res, appstrings.already_exists, 204);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})


app.post('/update',superAuth,async (req, res) => {
  try {
    const data = req.body;
    var logo1 = "";
    var logo2 = "";
    var logo3 = "";
  var password=""
    let responseNull= commonMethods.checkParameterMissing([data.companyId,data.companyName,data.email,data.address,data.phoneNumber])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

    //const newPassword = await hashPassword.generatePass(data.password);
    //Uploading Comapny Images
    if (req.files) {
      var ImageFile = req.files.logo1;
      if(ImageFile)
      {
        logo1 = Date.now() + '_' + ImageFile.name;
          ImageFile.mv(config.UPLOAD_DIRECTORY +"users/"+ logo1, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
      var ImageFile2 = req.files.logo2;
      if(ImageFile2)
      {
          logo2 = Date.now() + '_' + ImageFile2.name;
          ImageFile2.mv(config.UPLOAD_DIRECTORY +"users/"+ logo2, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
      var ImageFile3 = req.files.logo3;
      if(ImageFile3)
      {
        logo3 = Date.now() + '_' + ImageFile3.name;
        ImageFile3.mv(config.UPLOAD_DIRECTORY +"users/"+ logo3, function (err) {
          //upload file
          if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
    }
    const user = await COMPANY.findOne({
      where :{id :data.companyId }
    });
    if (user) {

      if(logo1 == "")
      {
        logo1 = user.dataValues.logo1;
      }
      if(logo2 == "")
      {
        logo2 = user.dataValues.logo2;
      }
      if(logo3 == "")
      {
        logo3 = user.dataValues.logo3;
      }
      //update Record
      const users = await COMPANY.update({
          companyName: data.companyName,
          email: data.email,
          address1: data.address,
          websiteLink: data.websiteLink,
          logo1:logo1,
          logo2:logo2,
          logo3:logo3,
          phoneNumber: data.phoneNumber,
          countryCode: data.countryCode,
          latitude: data.latitude,
          longitude: data.longitude,
          itemType:data.itemType,
          deliveryType:data.deliveryType,
          startTime:data.startTime,
          endTime:data.endTime,
        },
        {
          where :{id :data.companyId }
        }
      );
      if (users) {

        COMISSION.update({
          chargesPercent:data.charges,
          chargesAmount:data.fullAmount,
          chargesType:data.chargesType,
          installments:data.installments
        },{where:{companyId:data.companyId}})
        responseHelper.post(res, appstrings.update_success, null,200);
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);
    }
      else  responseHelper.post(res, appstrings.no_record, 204);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})



app.get('/view/:id',superAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"company");
}


   
      const findData = await COMPANY.findOne({
      where :{id: id }});

      const chargesData = await COMISSION.findOne({
        where :{companyId: id }});
     
   
      return res.render('super/company/viewCompany.ejs',{data:findData,chargesData});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"company");
    }


 
});



app.post('/delete',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.body.id])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await COMPANY.destroy({
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





module.exports = app;

//Edit User Profile
