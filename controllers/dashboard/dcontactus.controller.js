
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

const USER= db.models.users


app.get('/',adminAuth, async (req, res, next) => {
    
    try {
        const findData = await CONTACTUS.findAll({
        where :{status:1},
        order: [
          ['createdAt','DESC']
        ],      

        });
        return res.render('admin/contactus/contactus.ejs',{data:findData});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/status',adminAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await FAQ.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await FAQ.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, appstrings.success,updatedResponse);
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






module.exports = app;

//Edit User Profile
