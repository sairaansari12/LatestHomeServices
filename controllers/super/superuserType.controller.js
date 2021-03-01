
const express = require('express');
const app     = express();



app.get('/',superAuth, async (req, res, next) => {
    
    try {
        const findData = await USERTYPE.findAll({
        where :{companyId :req.companyId},
        order: [
          ['createdAt','DESC']
        ],      

        });
        return res.render('super/usertype/typesListing.ejs',{data:findData});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await USERTYPE.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await USERTYPE.update({
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

app.post('/add',superAuth,async (req, res) => {
  try {
    const data = req.body;
   var bannerImage=""

    let responseNull= commonMethods.checkParameterMissing([data.type])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

   


    const user = await USERTYPE.findOne({
      where: {
        userType: data.type,

      }
    });



    if (!user) {
      
      const users = await USERTYPE.create({
        userType: data.type,
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


    let responseNull= commonMethods.checkParameterMissing([data.type,data.typeId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



    const user = await USERTYPE.findOne({
      where: {
        id:data.typeId,

      }
    });



    if (user) {
      
      const users = await USERTYPE.update({
        userType: data.type,
        companyId:req.companyId


       },

      { where:
       {
id: data.typeId,
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
  return res.redirect(superadminpath+"usertype");
}


   
      const findData = await USERTYPE.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   
      return res.render('super/usertype/viewType.ejs',{data:findData});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"usertype");
    }


 
});



app.get('/delete/:id',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"usertype");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await USERTYPE.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(superadminpath+"usertype");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(superadminpath+"usertype");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(superadminpath+"usertype");
        }
});




module.exports = app;

//Edit User Profile
