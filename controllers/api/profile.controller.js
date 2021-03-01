
const express = require('express');
const app = express();



app.get('/getProfile', checkAuth,async (req, res, next) => {



    try{
		const userData = await USER.findOne({
		where: {
      id    : req.id,
      companyId: req.myCompanyId

		}
	  })  
      
    if(userData)
    return responseHelper.post(res, 'Profile Detail',userData);
    
    else
      return responseHelper.post(res, 'No Record Found', null, 204);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      

});



app.post('/updateProfile',checkAuth,async (req, res, next) => {
  const params = req.body;

  try{
 let responseNull=  commonMethods.checkParameterMissing([params.firstName,params.email,params.maritalStatus])
 if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

var imageName=""


  if (req.files) {
    ImageFile = req.files.profileImage;    
    imageName = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
    ImageFile.mv(config.UPLOAD_DIRECTORY +"users/"+ imageName, function (err) {
        //upload file
        if (err)
        responseHelper.error(res,err.message,400)
       // return res.json(jsonResponses.response(0, err.message, null));
    });
    }

  


const userData = await USER.findOne({
  where: {
    id: req.id ,
    companyId: req.myCompanyId

  }
});


if(userData)
{

  if(imageName=="")  imageName= userData.dataValues.image


const updatedResponse = await USER.update({
  firstName: params.firstName,
  lastName: params.lastName,
  address: params.address,
  image: imageName,
  email: params.email,
  dob: params.dob!=""?params.dob:null,
  maritalStatus: params.maritalStatus,
  anniversaryDate:params.anniversaryDate!=""?params.anniversaryDate:null,

},
{
  where : {
  id: userData.dataValues.id
}
});

if(updatedResponse)
      {
      const updatedResponseData = await USER.findOne({
        where: {
          id: userData.dataValues.id }
      });
     

      if(updatedResponseData)
    return responseHelper.post(res, 'Updated Successfully',updatedResponseData);
      }
      else{
        return responseHelper.post(res, 'Something went Wrong',400);
 
      }

}
  }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

 
})


app.post('/updateDatesInfo',checkAuth,async (req, res, next) => {
  const params = req.body;

  try{
 let responseNull=  commonMethods.checkParameterMissing([params.dob,params.maritalStatus])
 if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



const userData = await USER.findOne({
  where: {
    id: req.id ,
    companyId: req.myCompanyId

  }
});


if(userData)
{

const updatedResponse = await USER.update({
  dob: params.dob!=""?params.dob:null,
  maritalStatus: params.maritalStatus,
  anniversaryDate:params.anniversaryDate!=""?params.anniversaryDate:null,

},
{
  where : {
  id: userData.dataValues.id
}
});

if(updatedResponse)
      {
   return responseHelper.post(res, appstrings.update_success,null);
      }
      else{
        return responseHelper.post(res, appstrings.oops_something,400);
 
      }

}
  }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

 
})







module.exports = app;



//Edit User Profile
