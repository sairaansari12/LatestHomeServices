
const express = require('express');
const app     = express();

const EMPLOYEE= db.models.employees
const SERVICES = db.models.services
const Op = require('sequelize').Op;
const STAFFROLE= db.models.staffRoles;
EMPLOYEE.belongsTo(STAFFROLE,{foreignKey: 'role'})
STAFFWALLET.belongsTo(ORDERS,{foreignKey: 'orderId'})




app.get('/',superAuth, async (req, res, next) => {
    
    try {
        const findData = await STAFFROLE.findAll({
        where :{companyId :req.id},
        order: [
          ['createdAt','DESC']
        ],     

        });
     

       return res.render('super/employees/employeesListing.ejs',{roles:findData});


      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});







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
    companyId:req.companyId,
    status:  {[Op.or]: status}    
    }

    if(params.role && params.role)
  where.role=params.role;



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
      companyId: req.companyId,
      status:  {[Op.or]: status},
    }

  }
    
  

      


    try{


      var services = await EMPLOYEE.findAndCountAll({
        where: where,
      include:[{model:STAFFROLE,attributes:['userType']}],
      order: [[orderby,orderType]],
      distinct:true,
      offset:offset,limit:limit,

      })



      return responseHelper.post(res, appstrings.success, services);

  

    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});



app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await EMPLOYEE.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await EMPLOYEE.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, params.status==0?"Staff "+appstrings.active_success:"Staff "+appstrings.inactive_success,updatedResponse);
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
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
});

app.post('/subservice',superAuth,async(req,res,next) => { 
    
  var params=req.body

  var include=[]

  if(params.category!='0')
  {
   include=[ {
      model: SERVICES,
      as: 'category',
      attributes: ['name','icon','thumbnail'],
      required: true
    }

  
  ]
  }
    try{
      var services = await SERVICES.findAll({
        attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','turnaroundTime','includedServices','excludedServices'],
        where: {
          parentId: params.category,
          status: 1,
          deleted:0,
        },
        include: include,
        order: [
          ['orderby','ASC']
        ],
      })

if(services && services.length>0)   
{  
   for(i=0;i<services.length;i++){
  
        services[i]['rating'] = 0
      if(services[i].category==null || services[i].category==undefined)
      services[i]['category']=null
      
        // console.log(services[i].dataValues.category);
        

      }


      return responseHelper.post(res, appstrings.success, services);
    }
    else  return responseHelper.post(res, appstrings.no_record, null,204);


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

  
});





app.post('/add',superAuth,async (req, res) => {

  try {
    const data = req.body;
    var profileImage="",idProof="",coverImage=""
    var assignedServices=[]


    let responseNull= commonMethods.checkParameterMissing([data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    if(data.subcat && data.subcat.length>0) assignedServices=data.subcat.toString().split(",")
    if(data.service) assignedServices.push(data.service)

    const user = await EMPLOYEE.findOne({
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
  
        ImageFile.mv(config.UPLOAD_DIRECTORY +"employees/images/"+ profileImage, function (err) {
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
       // console.log(">>>>>>>>>>>>>>",profileImage)

      
      const users = await EMPLOYEE.create({
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        email: data.email,
        dob: data.dob,
        address: data.address,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        platform: 'web',
        image : profileImage,
        idProof : idProof,
        coverImage:coverImage,
        idProofName:data.idProofName,
        assignedServices:assignedServices.toString(),
        companyId: req.companyId
       });




      if (users) {

        responseHelper.post(res, appstrings.add_emp_success, null,200);
        //req.flash('successMessage',appstrings.add_emp_success);
        //return res.redirect(superadminpath+"employees");


       
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


app.get('/add',superAuth, async (req, res, next) => {
    
  try{
    const servicesData = await CATEGORY.findAll({
      attributes: ['id','name', 'icon','thumbnail'],
      where: {
        status: 1,
        level :1,
        id:  {[Op.not]: '0'},
             },
      order: [
        ['orderby','ASC']
      ],
    })

    const findData = await STAFFROLE.findAll({
      where: {
        companyId: req.id
      }
    });
    return res.render('super/employees/addEmployee.ejs',{services: servicesData,findData});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.get('/map',superAuth, async (req, res, next) => {
    
  try{
  
    return res.render('super/employees/employeeMap.ejs');

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});


app.post('/update',superAuth,async (req, res) => {

  try {
    const data = req.body;
    var assignedServices=[]
    var profileImage="",idProof="",coverImage=""

    let responseNull= commonMethods.checkParameterMissing([data.empId,data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


if(data.subcat && data.subcat.length>0) assignedServices=data.subcat.toString().split(",")
if(data.service) assignedServices.push(data.service)



    if (req.files) {

      ImageFile = req.files.image;    
      if(ImageFile)
      {
        profileImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"employees/images/"+ profileImage, function (err) {
          //upload file
          if (err)
         return responseHelper.error(res, err.message, 400);   
      });

    }

    ImageFile1 = req.files.idProof;    
    if(ImageFile1)
    {
      idProof = Date.now() + '_' + ImageFile1.name.replace(/\s/g, "");
    ImageFile1.mv(config.UPLOAD_DIRECTORY +"employees/proofs/"+ idProof, function (err) {
        //upload file
        if (err)
        {
          console.log(err)
        return responseHelper.error(res, err.message, 400);   
        }
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








    const user = await EMPLOYEE.findOne({
      attributes: ['phoneNumber'],
      where: {
        id:data.empId,
        companyId: req.companyId

      }
    });



    if (user) {

      if(profileImage=="") profileImage=user.dataValues.image
      if(idProof=="") idProof=user.dataValues.idProof
      if(coverImage=="") coverImage=user.dataValues.coverImage

      var userdata=await EMPLOYEE.findOne({where:{phoneNumber:data.phoneNumber,
        id: {
          [Op.not]:data.empId
        }
       
      }})

      
if(userdata) 
{
    responseHelper.error(res, appstrings.phone_exist, 400);

}
      
else{

      const users = await EMPLOYEE.update({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        address: data.address,
        dob: data.dob,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        image : profileImage,
        idProof : idProof,
        coverImage:coverImage,
        idProofName:data.idProofName,
        assignedServices:assignedServices.toString()
       },

      { where:
       {
id: data.empId,
companyId: req.companyId
       }
      }
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);

    }
    }
      else  responseHelper.post(res, appstrings.no_record, 204);

    

  } catch (e) {
    return responseHelper.error(res, 'Error While Creating User', e.message);
  }

})









app.get('/view/:id',superAuth,async(req,res) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"employees");
}


    
      const findData = await EMPLOYEE.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   
    
      const roletypess = await STAFFROLE.findAll({
      where: {
        companyId: req.id
      }
    });



    var ratingData = await STAFFRATINGS.findAll({
      attributes: ['id','rating','review','orderId','empId','createdAt'],
      where: {empId:id},
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: false
        },
{
        model: ORDERS,
        attributes: ['id','orderNo'],
        required: true,
        companyId:req.companyId,
        required: true
          }],

      order: [['createdAt','DESC']],
      distinct:true,
      offset: 0, limit: 10,

    })
    


    

    var pStatus= await commonMethods.getOrdersAllStatus(req.parentCompany);

      return res.render('super/employees/viewEmployee.ejs',{data:findData,roletypess,options:pStatus,ratings:ratingData});



    } catch (e) {
      console.log(e)
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"employees");
    }


 
});



app.get('/wallet',superAuth, async (req, res, next) => {
    var params=req.query
    var empId=params.empId
  try {
      const findData = await EMPLOYEE.findOne({
      where :{id :empId},
      });
   

     return res.render('super/employees/walletHistory.ejs',{empData:findData});


    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});



app.post('/wallet/history',superAuth, async (req, res, next) => {
  
  try {
    var params=req.body
    var payType =  ['0','1']
    var fromDate =  ""
    var toDate =  ""
    var empId=params.empId

    
    let responseNull=  common.checkParameterMissing([empId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  
  
    var page =1
    var limit =50
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit
  
  
    if(params.payType && params.payType!="")  payType=[params.payType]
  
    where={companyId: req.companyId,
      payType: { [Op.or]: payType},
      empId : empId
       }
  
  
    if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
    if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())
    
  
  if(fromDate!="" && toDate!="")
  {
    where= {companyId: req.companyId,
      payType: { [Op.or]: payType},
      createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
      empId : empId

         }
  
         
  
        }




        if(params.search && params.search!="")
        {
    
         where={ [Op.or]: [
            {payType: {[Op.like]: `%${params.search}%`}},
            {amount: { [Op.like]: `%${params.search}%` }}
          
          ],
          companyId: req.id,
          payType:  {[Op.or]: payType},
          empId : empId

        }
    
      }
        



  
        const findData = await STAFFWALLET.findAndCountAll({
          order: [
            ['createdAt', 'DESC'],  
        ],
        where :where,
        
        include: [
          {model: ORDERS , attributes: ['id','createdAt','orderNo']},       
        ],
        distinct:true,
        offset: offset, limit: limit ,
  
      });
  
  
    
      return responseHelper.post(res, appstrings.success, findData);
  
    } catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }
  
  
  });
  

  app.post('/depositAmount',superAuth,async (req, res) => {
    var params=req.body

    try{
        let responseNull=  commonMethods.checkParameterMissing([params.empId,params.amount])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

          STAFFWALLET.create({empId:params.empId,payType:1, companyId: req.id,amount:params.amount,orderId:""})
         
         var staffValues=await EMPLOYEE.findOne({attributes:['walletBalance'],where:{id:params.empId}});

         var updatedResponse=null
         if(staffValues && staffValues.dataValues)
          {
            var oldBalnce=staffValues.dataValues.walletBalance
            var walletBalance=oldBalnce+parseFloat(params.amount)
            updatedResponse=await   EMPLOYEE.update({walletBalance:walletBalance},{where:{id:params.empId}})

           
          }


      if(updatedResponse)
      return responseHelper.post(res, appstrings.payment_success,null,200);


       else
        return responseHelper.post(res, appstrings.oops_something,null,400);

      
    
   
         }
           catch (e) {
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
   
  });







app.post('/orders',superAuth,async(req,res) => { 
  
  try {
    var params=req.body
    var progressStatus =  ['0','1','2','3','4','5']
    var fromDate =  ""
    var toDate =  ""
  
  
    var page =1
    var limit =50
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit
  
  
    if(params.progressStatus && params.progressStatus!="")  progressStatus=[params.progressStatus]
  
    where={companyId: req.companyId,
    progressStatus: { [Op.or]: progressStatus}
       }
    
  
       where1={companyId: req.companyId,progressStatus: { [Op.or]: progressStatus}}
    if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
    if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())
    
  
  if(fromDate!="" && toDate!="")
  {
    where= {companyId: req.companyId,
      progressStatus: { [Op.or]: progressStatus},
      createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
         }
  
         where1={companyId: req.companyId,
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
          {model: ASSIGNMENT , attributes: ['id'], required:true,where:{empId:params.empId,jobStatus :[1,3]} },
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
        {model: ASSIGNMENT , attributes: ['id'], required:true,where:{empId:params.empId,jobStatus :[1,3]} }],

    
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


 

  app.post('/delete',superAuth,async(req,res,next) => { 
   

    let responseNull=  common.checkParameterMissing([req.body.id])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  
  
    try{
          //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
          const numAffectedRows = await EMPLOYEE.destroy({
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
             // return res.redirect(superadminpath+"category");
            }
  
          }catch (e) {
            return responseHelper.error(res, e.message, 400);
            //req.flash('errorMessage',appstrings.no_record)
            //return res.redirect(superadminpath+"category");
          }
  });
  







app.post('/search',superAuth, async (req, res, next) => {
  try {
    var params=req.body
    var page =1
    var limit =50
    var search=params.search
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit
  
    where={
      companyId:req.companyId,
      [Op.or]: [
        { 'orderNo': { [Op.like]: '%' + search + '%' }},
        { 'serviceDateTime': { [Op.like]: '%' + new Date(search) + '%' }},
        { 'orderPrice': { [Op.like]: '%' + search + '%' }},
        { 'totalOrderPrice': { [Op.like]: '%' + search + '%' }},
      ]
    }


    whereAddress= {[Op.or]: [
            
      { 'addressName': { [Op.like]: '%' + search + '%' }},
      { 'houseNo': { [Op.like]: '%' + search + '%' }},
      { 'town': { [Op.like]: '%' + search + '%' }},
      { 'city': { [Op.like]: '%' + search + '%' }},
      { 'landmark': { [Op.like]: '%' + search + '%' }}]}


      whereUser= 
        {
          phoneNumber :{[Op.not]:""},
          [Op.or]: [
            { 'phoneNumber': { [Op.like]: '%' + search + '%' }},
            { 'firstName': { [Op.like]: '%' + search + '%' }},
            { 'lastName': { [Op.like]: '%' + search + '%' }}
        ]}
       // { '$Comment.body$': { like: '%' + query + '%' }
var findData= await findSearchData(where,{},{},offset,limit)


if(findData.rows.length==0)
{
 findData= await findSearchData({companyId:req.companyId},whereAddress,{},offset,limit)
}



if(findData.rows.length==0)
{

 findData= await findSearchData({companyId:req.companyId},{},whereUser,offset,limit)
}
      var userDtaa={}
      userDtaa.data=findData
      userDtaa.counts=countDataq
     
  
      return responseHelper.post(res, appstrings.success, userDtaa);
  
    } catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }
  
  
  });

module.exports = app;

//Edit User Profile
