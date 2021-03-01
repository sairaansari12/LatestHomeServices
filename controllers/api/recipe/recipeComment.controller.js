const express = require('express');
const app = express();
const Op = require('sequelize').Op;

//Relations

RECOMMENT.belongsTo(USER,{foreignKey: 'userId'})

//Home API with cats and trending and banners



app.get('/list',checkAuth,async(req,res) => { 
  
  try {
    var params=req.query
    var page =1
    var limit =30

    let responseNull=  common.checkParameterMissing([params.recipeId])
    if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);
  




    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit
  
   
 
        const findData = await RECOMMENT.findAll({
        attributes:['userId','comment','createdAt','recipeId'],
        where :{recipeId:params.recipeId},
        
        include: [
          {model: USER , attributes: ['id','firstName','lastName',"phoneNumber","countryCode","image"]},
        ],
        order: [['createdAt','DESC']] ,
        offset:offset,limit:limit,
        distinct:true,

      });
  
      
       
  if(findData.length>0)
      return responseHelper.post(res, appstrings.success, findData);
  
      else  return responseHelper.post(res, appstrings.no_record, null,204);

    } catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }
  
  
  });


app.post('/add', checkAuth,async (req, res, next) => {

  var params=req.body
  let responseNull=  common.checkParameterMissing([params.recipeId,params.comment])
  if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);


  
    try{

     var response=await RECOMMENT.create({userId:req.id,recipeId:params.recipeId,comment:params.comment})

      
if(response)
return responseHelper.post(res,appstrings.added_success, null);
else return responseHelper.post(res,appstrings.oops_something, null,400);

      

    
    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});


app.delete('/delete', checkAuth,async (req, res, next) => {

  var params=req.query
  let responseNull=  common.checkParameterMissing([params.commentId])
  if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);


  
    try{

      const numAffectedRows = await RECOMMENT.destroy({
        where: {
          id: params.commentId
        }
        })  
          
        if(numAffectedRows>0)
        
      
return responseHelper.post(res,appstrings.added_success, null);
else return responseHelper.post(res,appstrings.oops_something, null,400);

      

    
    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});


module.exports = app;