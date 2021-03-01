
const express = require('express');
const app     = express();



app.get('/',superAuth, async (req, res, next) => {
    
    try {
        const findData = await CANCELREASON.findAll({
        where :{companyId :req.companyId},
        order: [
          ['createdAt','DESC']
        ],      

        });
        return res.render('super/cancellation/cancellationListing.ejs',{data:findData});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await CANCELREASON.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await CANCELREASON.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, params.status==0?"Cancellation item "+appstrings.active_success:"Cancellation item "+appstrings.inactive_success,updatedResponse);
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


app.get('/add',superAuth, async (req, res, next) => {
    
  try{
  
    return res.render('super/cancellation/addCancellation.ejs',);

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/addCancellation',superAuth,async (req, res) => {
  try {
    const data = req.body;
   var bannerImage=""

    let responseNull= commonMethods.checkParameterMissing([data.reason])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

   


    const user = await CANCELREASON.findOne({
      where: {
        reason: data.reason,

      }
    });



    if (!user) {
      
      const users = await CANCELREASON.create({
        reason: data.reason,
        companyId:req.companyId

       });


      if (users) {

        responseHelper.post(res, appstrings.added_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})


app.post('/update',superAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.reason,data.reasonId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



    const user = await CANCELREASON.findOne({
      where: {
        id:data.reasonId,

      }
    });



    if (user) {
      
      const users = await CANCELREASON.update({
        reason: data.reason,
        companyId:req.companyId


       },

      { where:
       {
id: data.reasonId,
companyId: req.companyId
       }
      }
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.post(res, appstrings.no_record, 204);

    

  } catch (e) {
    return responseHelper.error(res, e.message, null);
  }

})



app.get('/view/:id',superAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"cancellation");
}


   
      const findData = await CANCELREASON.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   
      return res.render('super/cancellation/viewCancellation.ejs',{data:findData});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"cancellation");
    }


 
});



app.get('/delete/:id',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"cancellation");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await CANCELREASON.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(superadminpath+"cancellation");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(superadminpath+"cancellation");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(superadminpath+"cancellation");
        }
});




module.exports = app;

//Edit User Profile
