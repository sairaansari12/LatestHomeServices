
const express = require('express');
const app = express();
const sequelize = require('sequelize');

const ADDRESS=db.models.address

app.get('/list', checkAuth,async (req, res, next) => {



    try{
		const userData = await ADDRESS.findAll({
		where: {
      userId    : req.id,
      status:1,
    },
    order: [
      ['createdAt', 'DESC'],
     
  ],
	  })  
      
    if(userData && userData.length>0)
    return responseHelper.post(res, appstrings.detail,userData);
    
    else
      return responseHelper.post(res, appstrings.no_record, null, 204);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      

});

app.delete('/delete',async(req,res, next) => {
  const params = req.query;
  
  let responseNull=  common.checkParameterMissing([params.addressId])
  if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);

  try{
    const numAffectedRows = await ADDRESS.update({
      status: 0},
    {where: {
      id: params.addressId
  
    }
    })  
      
    if(numAffectedRows>0)
    return responseHelper.post(res, appstrings.address_delete_success,null);
    else
      return responseHelper.error(res, appstrings.no_record, 404);
  } 
    
  

catch (e) {
  return responseHelper.error(res, e.message, 400);
}
    
   });

app.put('/update',checkAuth,async (req, res, next) => {
  const params = req.body;
var defaultAdd=0 
if(params.default) defaultAdd=params.default
 
  try{
 let responseNull=  commonMethods.checkParameterMissing([params.addressId,params.addressName,params.latitude,params.longitude])
 if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


const userData = await ADDRESS.findOne({
  where: {
    id:params.addressId,
    userId: req.id }
});


if(userData)
{

const updatedResponse = await ADDRESS.update({
  addressName: params.addressName,
  latitude: params.latitude,
  longitude: params.longitude,
  town: params.town,
  landmark: params.landmark,
  city :params.city,
  addressType : params.addressType,
  userId : req.id,
  houseNo : params.houseNo,
  default : defaultAdd


},
{
  where : {
  id: userData.id
}
});

if(updatedResponse)
      {
      const updatedResponseData = await ADDRESS.findOne({
        where: {
          id: userData.dataValues.id }
      });
     
    if(updatedResponseData)
    {
if(defaultAdd==1) removeAllDefault(userData.dataValues.id)

      return responseHelper.post(res, 'Updated Successfully',updatedResponseData);

    }
      }
      else{
        return responseHelper.post(res, appstrings.oops_something,400);
 
      }
}

else
 return responseHelper.post(res, appstrings.no_record, null, 404);



  }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

 
});

app.post('/add',checkAuth,async (req, res, next) => {
  const params = req.body;
  var defaultAdd=0 
  if(params.default) defaultAdd=params.default
  try{
 let responseNull=  commonMethods.checkParameterMissing([params.addressName,params.latitude,params.longitude,params.city])
 if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


const userData = await ADDRESS.findOne({
  where: {
    latitude:params.latitude,
    longitude: params.longitude,
    userId :req.id,
    status:1
  }
});


if(userData)
{
  return responseHelper.post(res, appstrings.already_exists, null, 400);

}

  else
  {
const response = await ADDRESS.create({
  addressName: params.addressName,
  latitude: params.latitude,
  longitude: params.longitude,
  town: params.town,
  landmark: params.landmark,
  city :params.city,
  addressType : params.addressType,
  houseNo : params.houseNo,
  default : defaultAdd,
  companyId :req.parentCompany,
  userId : req.id
});

if(response)
   {
    if(defaultAdd==1) removeAllDefault(response.id)
    return responseHelper.post(res, appstrings.added_success,response);

   }
      
      else{
        return responseHelper.post(res, appstrings.oops_something,400);
 
      }
}



  }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

 
});

 

async function removeAllDefault(myId)
{
   const dataUpdate=await ADDRESS.update({
    default : 0
  },
  {
    where : {
   
      
      id: { [sequelize.Op.not]: myId} 
  }
  });

console.log("UPDATED DATA>>>>",dataUpdate)
}


module.exports = app;



//Edit User Profile
