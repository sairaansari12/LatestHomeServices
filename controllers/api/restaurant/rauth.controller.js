
const express = require('express');
const app     = express();
const hashPassword = require('../../../helpers/hashPassword');
const Op = require('sequelize').Op;
const jwt = require('jsonwebtoken');





app.post('/login',async (req, res, next) => {
  const params = req.body;


  let responseNull=  commonMethods.checkParameterMissing([params.email,params.password])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  try{
		const userData = await COMPANY.findOne({
		where: {
      email: params.email,
                  role:2,
                  status:1

		}
	  })  
      
    if(userData)
   {
   
    const match = await hashPassword.comparePass(params.password,userData.dataValues.password);
        
                if (!match) 
               return responseHelper.post(res, appstrings.invalid_cred,null,400);

                
                   

                

      let token = jwt.sign(
        {
          phoneNumber: userData.dataValues.phoneNumber,
          companyId:    userData.dataValues.companyId,
          countryCode: userData.dataValues.countryCode,
          userType: 2,
          parentCompany: userData.dataValues.parentId,
          id : userData.dataValues.id

        },
        config.jwtToken,
        { algorithm: 'HS256', expiresIn: '2880m' }
      );



      const updatedResponse = await COMPANY.update({
        sessionToken: token,
        platform: params.platform,
        deviceToken: params.deviceToken,
      },
      {
        where : {
        id: userData.dataValues.id
      },
      returning: true,
      plain:true,
      });
     
    
    
      if(updatedResponse)
      {
        userData.dataValues.sessionToken=token
       return responseHelper.post(res, 'Login Successfully',userData);
      }
    }
    else 
    return responseHelper.post(res, appstrings.invalid_cred,null,400);


      
}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})


app.post('/logout',restAuth,async (req, res, next) => {
  const params = req.body;
try{

  const updatedResponse = await COMPANY.update({
    sessionToken: "",
    deviceToken: "",
  },
  {
    where : {
    id:req.id
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

module.exports = app;

//Edit User Profile
