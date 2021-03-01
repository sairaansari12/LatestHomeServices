
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;





/**
*@role Get User Page
*/
app.get('/',adminAuth, async (req, res, next) => {
    
    try {
       

      
       return res.render(adminfilepath+'users/usersListing.ejs');


      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});







app.post('/list',adminAuth,async (req, res, next) => {

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

  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {
    companyId:req.id,
    status:  {[Op.or]: status}    
    }

 

   var where= {
    companyId:req.companyId,
    status:  {[Op.or]: status}    
    }

    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {firstName: {[Op.like]: `%${params.search}%`}},
        {lastName: { [Op.like]: `%${params.search}%` }},
        {email: { [Op.like]: `%${params.search}%` }},
        {phoneNumber: { [Op.like]: `%${params.search}%` }},
        {countryCode: { [Op.like]: `%${params.search}%` }},
        {address: { [Op.like]: `%${params.search}%` }}


      ],
      companyId: req.id,
      status:  {[Op.or]: status},
    }

  }
    
  

      


    try{


      var services = await USERS.findAndCountAll({
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



app.post('/status',adminAuth,async(req,res,next) => { 
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await USERS.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await USERS.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, params.status==0?"User "+appstrings.active_success:"User "+appstrings.inactive_success,updatedResponse);
             }
             else{
               return responseHelper.post(res, 'Something went Wrong',400);
    
        }
        
      
      }
      else
        return responseHelper.post(res, appstrings.no_record,204);
      
    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
});



app.post('/add',adminAuth,async (req, res) => {

  try {
    const data = req.body;
    var profileImage="",idProof="",coverImage=""
    var assignedServices=[]


    let responseNull= commonMethods.checkParameterMissing([data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



    const user = await USERS.findOne({
      attributes: ['phoneNumber'],
      where: {
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
      }
    });



    if (!user) {



      if (req.files) {

        ImageFile = req.files.image;    
        if(ImageFile)
        {
          profileImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
  
        ImageFile.mv(config.UPLOAD_DIRECTORY +"users/images/"+ profileImage, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.meessage, 400);   
          });
  
      }

      ImageFile1 = req.files.idProof;    
      if(ImageFile1)
      {
        idProof = Date.now() + '_' + ImageFile1.name.replace(/\s/g, "");
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"employees/proofs/"+ idProof, function (err) {
          //upload file
          if (err)
          responseHelper.error(res, appstrings.err.meessage, 400);   
           });
    }
      

    ImageFile2 = req.files.coverImage;    
    if(ImageFile2)
    {
      coverImage = Date.now() + '_' + ImageFile2.name.replace(/\s/g, "");
    ImageFile2.mv(config.UPLOAD_DIRECTORY +"employees/images/"+ coverImage, function (err) {
        //upload file
        if (err)
        {
          console.log(err)
        return responseHelper.error(res, err.message, 400);   
        }
      });
  }



        }

      
      const users = await USERS.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        dob: data.dob,
        address: data.address,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        platform: 'web',
        image : profileImage,
        companyId: req.id
       });




      if (users) {

        responseHelper.post(res, appstrings.add_emp_success, null,200);
        //req.flash('successMessage',appstrings.add_emp_success);
        //return res.redirect(adminpath+"employees");


       
      }
     else 
      responseHelper.error(res, appstrings.oops_something, 400);

    }
      else  
      responseHelper.error(res, appstrings.already_exists, 400);

  } catch (e) {
     return responseHelper.error(res, e.message,400);
    //return req.flash('errorMessage',appstrings.oops_something)

  }

})


app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
  
   
    return res.render(adminfilepath+'users/addUser.ejs');

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});


app.post('/update',adminAuth,async (req, res) => {

  try {
    const data = req.body;
    var profileImage=""

    let responseNull= commonMethods.checkParameterMissing([data.userId,data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



    if (req.files) {

      ImageFile = req.files.image;    
      if(ImageFile)
      {
        profileImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"users/"+ profileImage, function (err) {
          //upload file
          if (err)
         return responseHelper.error(res, err.message, 400);   
      });

    }

 
  }
 
    
      



    const user = await USERS.findOne({
      attributes: ['phoneNumber'],
      where: {
        id:data.userId,
        companyId: req.companyId

      }
    });



    if (user) {

      if(profileImage=="") profileImage=user.dataValues.image
      var userdata=await USERS.findOne({where:{phoneNumber:data.phoneNumber,
        id: {
          [Op.not]:req.id
        }
       
      }})

if(userdata) 
{
    responseHelper.error(res, appstrings.phone_exist, 400);

}
else{
      
      const users = await USERS.update({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
        dob: data.dob,
        anniversaryDate:(data.anniversaryDate && data.anniversaryDate!="")?data.anniversaryDate:null ,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        maritalStatus: data.maritalStatus,
        image : profileImage,
       },

      { where:
       {
id: data.userId,
       }
      }
       
       );


      if (users) 

        responseHelper.post(res, appstrings.update_success, null,200);
       
      
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
  }
      else  responseHelper.post(res, appstrings.no_record, 204);

    

  } catch (e) {
    return responseHelper.error(res, 'Error While Creating User', e.message);
  }

})









app.get('/view/:id',adminAuth,async(req,res) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"users");
}


    
      const findData = await USERS.findOne({
      where :{companyId :req.id, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   
  
    var pStatus= await commonMethods.getOrdersAllStatus(req.parentCompany);

      return res.render(adminfilepath+'users/viewUser.ejs',{data:findData,options:pStatus});



    } catch (e) {
      console.log(e)
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"users");
    }


 
});



app.post('/orders',adminAuth,async(req,res) => { 
  
  try {
    var params=req.body
    var pStatus= await commonMethods.getOrdersAllStatus(req.id);
    var progressStatus = pStatus.map(user => user.status);    var fromDate =  ""
    var toDate =  ""
  
  
    var page =1
    var limit =50
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit
  
  
    if(params.progressStatus && params.progressStatus!="")  progressStatus=[params.progressStatus]
  
    where={userId: params.userId,
    progressStatus: { [Op.or]: progressStatus}
       }
    
  
       where1={userId: params.userId,progressStatus: { [Op.or]: progressStatus}}
    if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
    if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())
    
  
  if(fromDate!="" && toDate!="")
  {
    where= {userId: params.userId,
      progressStatus: { [Op.or]: progressStatus},
      createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
         }
  
         where1={userId: params.userId,
          progressStatus: { [Op.or]: progressStatus},
          createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
             }
  
        }
  
        const findData = await ORDERS.findAndCountAll({
          order: [
            ['createdAt', 'DESC'],  
        ],
        where :where,
        
        include: [
          {model: db.models.address , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,
          {model: ASSIGNMENT , attributes: ['id'],where:{jobStatus :[1,3]} },
          {model: USER , attributes: ['id','firstName','lastName',"phoneNumber","countryCode","image"]},
          {model: ORDERSTATUS , attributes: ['id','statusName']},

  
          {model: SUBORDERS , attributes: ['id','serviceId','quantity'],
          include: [{
            model: SERVICES,
            attributes: ['id','name','description','price','icon','thumbnail','type','price','duration'],
            required: false
          }]
          }
        
        ],
        offset: offset, limit: limit ,
        distinct:true,

      });
  
      var countDataq = await ORDERS.findAll({
        attributes: ['progressStatus',
          [sequelize.fn('sum', sequelize.col('totalOrderPrice')), 'totalSum'],
          [sequelize.fn('COUNT', sequelize.col('progressStatus')), 'count'],
         
  
        ],
        group: ['progressStatus'],
      where :where1,
      include: [
        {model: ASSIGNMENT , attributes: ['id'],where:{jobStatus :[1,3]} }],

    
    });
  
  
  
   
  
      var userDtaa={}
      userDtaa.data=findData
      userDtaa.counts=countDataq
     
  
      return responseHelper.post(res, appstrings.success, userDtaa);
  
    } catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }
  
  
  });


  app.post('/delete',adminAuth,async(req,res,next) => { 
   

    let responseNull=  common.checkParameterMissing([req.body.id])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  
  
    try{
          //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
          const numAffectedRows = await USERS.destroy({
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
