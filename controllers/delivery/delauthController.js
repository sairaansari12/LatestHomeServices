
const express = require('express');

const app = express();
const bcrypt = require('bcryptjs');
const hashPassword = require('../../helpers/hashPassword');
const jwt = require('jsonwebtoken');
require('dotenv').config({
  path: `../env-files/${process.env.NODE_ENV || 'development'}.env`,
});


// Generate Hash
const createHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};




app.post('/logout',checkAuth,async (req, res, next) => {
  const params = req.body;
try{

  const updatedResponse = await EMPLOYEE.update({
    sessionToken: "",
    deviceToken: "",
    loginstatus: 0,

  },
  {
    where : {
    id:req.id,
    companyId: req.myCompanyId
  }
  });



  if(updatedResponse)
  {
    return responseHelper.post(res, 'Logout Successfully');
  }
    
else
return responseHelper.post(res, 'Logout Successfully');


}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  

  
 
})



app.post('/markStatus',checkAuth,async (req, res, next) => {
  const params = req.body;
try{

  let responseNull=  commonMethods.checkParameterMissing([params.status])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  const updatedResponse = await EMPLOYEE.update({
    loginstatus: params.status,
  },
  {
    where : {
    id:req.id
  }
  });



    return responseHelper.post(res, params.status==1?appstrings.mark_online:appstrings.mark_offline ,null);


}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  

  
 
})


app.post('/login',async (req, res, next) => {
  const params = req.body;


  let responseNull=  commonMethods.checkParameterMissing([params.phoneNumber,params.countryCode])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  try{
		const userData = await EMPLOYEE.findOne({
		where: {
      phoneNumber: params.phoneNumber,
      countryCode: params.countryCode,

		}
	  })  
      
    if(userData)
   {
   

    var parentCompany=""
    //var parent=await commonMethods.getParentCompany(userData.dataValues.companyId)
    //if(parent && parent.dataValues)parentCompany=parent.dataValues.parentId


    parentCompany=config.PARENT_COMPANY
      let token = jwt.sign(
        {
          phoneNumber: params.phoneNumber,
          myCompanyId:    userData.dataValues.companyId,
          countryCode: params.countryCode,
          userType: 3,
          parentCompany:parentCompany,
          id : userData.dataValues.id

        },
        config.jwtToken,
        { algorithm: 'HS256', expiresIn: '2880m' }
      );



      const updatedResponse = await EMPLOYEE.update({
        sessionToken: token,
        platform: params.platform,
        loginstatus: 1,
        deviceToken: params.deviceToken,
      },
      {
        where : {
        id: userData.dataValues.id
      }
      });
     
    
    
      if(updatedResponse)
      {


userData.dataValues.sessionToken=token
userData.dataValues.platform=params.platform
userData.dataValues.deviceToken=params.deviceToken


    return responseHelper.post(res, 'Login Successfully',userData);
      }
      }

      else{

        return responseHelper.post(res, appstrings.invalid_cred,null,400);

    
      }

  
}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})




module.exports = app;



//Edit User Profile
