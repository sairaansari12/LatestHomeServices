const express = require('express');
const app = express();
const Op = require('sequelize').Op;

//Relations

RECIPES.hasOne(RELIKE,{foreignKey: 'recipeId'})

//Home API with cats and trending and banners



app.post('/likeUnlike', checkAuth,async (req, res, next) => {

  var params=req.body
  var like=1
  let responseNull=  common.checkParameterMissing([params.recipeId])
  if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);

  if(params.like && params.like=="0")
   like="0"
  

   
    try{

       var likeData= await RELIKE.findOne({where:{userId:req.id,recipeId:params.recipeId}})

       if(likeData && like=="1")
       return responseHelper.post(res, appstrings.already_liked_recipe, null,204);


       else{
      if(like==1)
      
        RELIKE.create({userId:req.id,recipeId:params.recipeId})

      

      else
         RELIKE.destroy({where: {userId:req.id,recipeId:params.recipeId}})

        var message=(like==1)?appstrings.liked_success : appstrings.unliked_success
         return responseHelper.post(res,message, null);

      

    }
    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});


module.exports = app;