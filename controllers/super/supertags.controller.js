
const express = require('express');
const app     = express();



app.get('/',superAuth, async (req, res, next) => {
  try {

   


    const tagsData = await TAGS.findAll({
      where: {
        companyId: req.id,
      }
    });


    return res.render('super/settings/tags.ejs',{tags:tagsData});
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

/**
*@role Add TAg
*/
app.post('/addTag',superAuth, async (req, res, next) => {
  try {
    const params = req.body;
    
  
    let responseNull=  common.checkParameterMissing([params.tag])
    if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);
  
   var response=TAGS.create({tag:params.tag,companyId:req.id})
  if(response)
    return responseHelper.post(res, appstrings.success, null,200);
    else
    return responseHelper.post(res, appstrings.oops_something, null,400);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});



app.post('/delete',superAuth,async(req,res,next) => { 
  let responseNull=  common.checkParameterMissing([req.body.id])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await TAGS.destroy({
          where: {
            id: req.body.id
          }
          })  
            
          if(numAffectedRows>0)
          {
          // req.flash('successMessage',appstrings.delete_success)
         return responseHelper.post(res, appstrings.delete_success,null,200);
        }

          else {
            return responseHelper.post(res, appstrings.no_record,null,400);
           // return res.redirect(adminpath+"category");
          }

        }catch (e) {
          return responseHelper.error(res, e.message, 400);
          //req.flash('errorMessage',appstrings.no_record)
          //return res.redirect(adminpath+"category");
        }
});


module.exports = app;

//Edit User Profile
