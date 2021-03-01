
const express = require('express');
const app = express();
const Op = require('sequelize').Op;

const FAVOURITE=db.models.favourites
//Relations
FAVOURITE.belongsTo(SERVICES,{foreignKey: 'serviceId'})




app.post('/add',checkAuth,async (req, res, next) => {
  const params = req.body;


  let responseNull=  commonMethods.checkParameterMissing([params.serviceId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  try{
		const favData = await FAVOURITE.findOne({
		where: {
      serviceId: params.serviceId,
      userId: req.id,
      companyId: req.companyId,
      
		}
	  })  
      
    if(favData)
    return responseHelper.post(res, appstrings.already_exists, null, 400);

   

else{


    const createResponse = await FAVOURITE.create({

      serviceId: params.serviceId,
      userId: req.id,
      companyId: req.companyId,
	
      })  
      
      if(createResponse) 

      return responseHelper.post(res, appstrings.fav_success, createResponse);

      else return responseHelper.post(res, appstrings.oops_something, null,400);

}


 }
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})



app.get('/list',checkAuth,async (req, res) => {
   
  try{
     var findData = await FAVOURITE.findAll({
       order: [
         ['createdAt', 'DESC'],  
     ],
     where :{userId : req.id
      
     },
     
     include: [
       {model: SERVICES , required:true,attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','companyId','createdAt','status','rating','itemType'],
     
       include:[ {
         model: CATEGORY,
         as: 'category',
         attributes: ['id','name','companyId'],
         required: true
       }]
     }
     
      
     ]

     });



    

   return responseHelper.post(res,appstrings.detail,findData);

}
 catch (e) {
   return responseHelper.error(res, e.message, 400);
 }
    
   
 })

app.delete('/remove',checkAuth,async(req,res, next) => {
    const params = req.query;
    
    let responseNull=  common.checkParameterMissing([params.favId])
    if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);
  
    try{
      const findData = await FAVOURITE.findOne({
      where: {
        id: params.favId,
        userId: req.id,
        
      }
      })  
        
      if(findData)
     {

const numAffectedRows = await FAVOURITE.destroy({
    where: {
      id: params.favId
  
    }
    })  
      
    if(numAffectedRows>0)
    return responseHelper.post(res, appstrings.fav_delete_success,null);
   
  }
  else
  return responseHelper.error(res, appstrings.no_record, 404);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      
     });


module.exports = app;



//Edit User Profile
