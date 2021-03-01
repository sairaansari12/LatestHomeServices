
const express = require('express');
const app     = express();

app.get('/',adminAuth, async (req, res, next) => {
    
    try {
      //console.log("req id",req.id);

        const findData = await NOTIFICATION.findAll({
        where :{userId :req.id,role:[2,3]},
        order: [
          ['createdAt','DESC']
        ],      

        });

        await NOTIFICATION.update({readStatus:1},
         { where :{userId :req.id}
          });
        return res.render('admin/notification/notificationListing.ejs',{data:findData});

      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});



app.get('/new',adminAuth, async (req, res, next) => {
    
  try {
      
    var types=await commonMethods.getUserTypes(req.id) 

      return res.render('admin/notification/addNotification.ejs',{types:types});

    } catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }


});

app.get('/newEmail',adminAuth, async (req, res, next) => {
    
  try {
      
    var types=await commonMethods.getUserTypes(req.id) 

      return res.render('admin/notification/addEmail.ejs',{types:types});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});


app.post('/count',adminAuth,async(req,res,next) => { 
    
    try{
       
      const findData = await NOTIFICATION.findAll({
        where :{userId :req.id,role:[2,3],readStatus:0},
        order: [
          ['createdAt','DESC']
        ],      

        });
       
       if(findData)
       {
       
     return responseHelper.post(res, appstrings.success,findData);
            
      
       }

       else{
        return responseHelper.post(res, appstrings.no_record,204);

      }

         }
           catch (e) {
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
});


app.post('/push',adminAuth,async(req,res,next) => { 
    
  var params=req.body
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.userType,params.title,params.description])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     var userData=null
     if(params.userType=="0") userData = await USER.findAll({});
     else userData = await USER.findAll({where: { userType: params.userType }});

     if(userData)
     {
     
      var androidtokens=userData.reduce((ids, thing) => {
        if ( thing.deviceToken!="") {
          ids.push(thing.deviceToken);
        }
        return ids;
      }, []);

      // var iostokens=userData.reduce((ids, thing) => {
      //   if (thing.platform.toLowerCase()=="ios" && thing.deviceToken!="") {
      //     ids.push(thing.deviceToken);
      //   }
      //   return ids;
      // }, []);

     
        var pushAndroidData={title:params.title,description:params.description,token:androidtokens,
          notificationType:"ADMIN_NOTIF",status:0,
          orderId:"",
        
        }
       // var pushIosData={title:params.title,description:params.description,token:iostokens,  platform:"ios"}

commonNotification.sendNotification(pushAndroidData)
//commonNotification.sendNotification(pushIosData)

    

  
         return responseHelper.post(res, appstrings.success,null);
           }
           else
             return responseHelper.post(res, appstrings.no_record,null,204);
  
           
     


       }
         catch (e) {
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});
  



app.post('/push',adminAuth,async(req,res,next) => { 
    
  var params=req.body
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.userType,params.title,params.description])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     var userData=null
     if(params.userType=="0") userData = await USER.findAll({});
     else userData = await USER.findAll({where: { userType: params.userType }});

     if(userData)
     {
     
      var androidtokens=userData.reduce((ids, thing) => {
        if ( thing.deviceToken!="") {
          ids.push(thing.deviceToken);
        }
        return ids;
      }, []);

      // var iostokens=userData.reduce((ids, thing) => {
      //   if (thing.platform.toLowerCase()=="ios" && thing.deviceToken!="") {
      //     ids.push(thing.deviceToken);
      //   }
      //   return ids;
      // }, []);

     
        var pushAndroidData={title:params.title,description:params.description,token:androidtokens,
          notificationType:"ADMIN_NOTIF",status:0,
          orderId:"",
        
        }
       // var pushIosData={title:params.title,description:params.description,token:iostokens,  platform:"ios"}

commonNotification.sendNotification(pushAndroidData)
//commonNotification.sendNotification(pushIosData)

    

  
         return responseHelper.post(res, appstrings.success,null);
           }
           else
             return responseHelper.post(res, appstrings.no_record,null,204);
  
           
     


       }
         catch (e) {
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});
  

app.post('/pushEmail',adminAuth,async(req,res,next) => { 
    
  var params=req.body
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.userType,params.email])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     var userData=null
     if(params.userType=="0") userData = await USER.findAll({});
     else userData = await USER.findAll({where: { userType: params.userType }});

     if(userData)
     {
     
      var emails=userData.reduce((ids, thing) => {
        if (thing.email!="") {
          ids.push(thing.email);
        }
        return ids;
      }, []);

      
  console.log(emails)
if(emails.length>0) commonNotification.sendMail(emails,params.email)
return responseHelper.post(res, appstrings.success,null);
           }
           else
             return responseHelper.post(res, appstrings.no_record,null,204);
  
           
     


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
     
    

     const userData = await NOTIFICATION.findOne({
       where: {
         id: params.id }
     });
     
     
     if(userData)
     {
     

     const updatedResponse = await NOTIFICATION.update({
       readStatus: status,
  
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



app.get('/delete/:id',adminAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"notification");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await NOTIFICATION.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
            return responseHelper.post(res, appstrings.delete_success, null,200);

          }

          else {
            return responseHelper.noData(res, appstrings.no_record);
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          return responseHelper.noData(res, appstrings.no_record);
        }
});

app.get('/clearAll',adminAuth,async(req,res,next) => { 
   
  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await NOTIFICATION.destroy({
          where: {
            userId: req.id,
            role:2
          }
          })  
            
          if(numAffectedRows>0)
          {
            return responseHelper.post(res, appstrings.delete_success, null,200);

          }

          else {
            return responseHelper.noData(res, appstrings.no_record);
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          return responseHelper.noData(res, appstrings.no_record);
        }
});




module.exports = app;

//Edit User Profile
