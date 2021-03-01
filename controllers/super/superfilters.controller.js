
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;
var uuid = require('uuid');

/////////////////////////////////////////////////////////
////////// Delivery Instruction ////////////////////////
////////////////////////////////////////////////////////

app.get('/',superAuth, async (req, res, next) => {
  try {
    var params=req.query
    var category=params.category

      var findData = await FILTERS.findAll({
        where: {
          companyId: req.companyId,
          categoryId:category
        }
      });
      

      if(findData.length>0) 
      {

        findData=JSON.parse(JSON.stringify(findData))
        var cid=findData[0].cid
      return res.render('super/filters/filters.ejs',{data:findData,category,cid});

      }
      else
      return res.render('super/filters/addFilter.ejs',{category});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
});



app.post('/add',superAuth,async (req, res) => {
  try {
    const data = req.body;
    let responseNull= commonMethods.checkParameterMissing([data.filter1,data.filter2,data.category])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    const user = await FILTERS.findOne({
      attributes: ['id'],

      where: {
        categoryId: data.category,
        companyId:req.id
      }
    });

    if (!user) {

      var cid= uuid.v1();
      const users = await FILTERS.create({
        filter:data.filter1,
        companyId: req.id,
        cid:cid,
        categoryId: data.category,
        status: '1'
       });

       await FILTERS.create({
        filter:data.filter2,
        companyId: req.id,
        cid:cid,
        categoryId: data.category,
        status: '1'
       });



      if (users) {
        responseHelper.post(res, appstrings.success, null,200);
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);

    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})

app.post('/update',superAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.category,data.filterId,data.filter1,data.filter2])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


   


    const user = await FILTERS.findAll({
      attributes: ['id'],

      where: {
        cid: data.filterId,
        companyId: req.id

      }
    });




    if (user.length>0) {
    
    
      
       

      var users = await FILTERS.update({
        filter: data.filter1,
        companyId: req.id,
        categoryId: data.category,
        status: '1'
       },
       {where:{
        id: user[0].id
       }});


       if(user.length>1)
       {
     await FILTERS.update({
        filter: data.filter2,
        companyId: req.id,
        categoryId: data.category,
        status: '1'
       },
       {where:{
        id: user[1].id
       }}
       );
      }

      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
   // console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})

app.post('/delete',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.body.id])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



  try{
      
      
      

        const numAffectedRows = await FILTERS.destroy({
         where: {
            cid: req.body.id
          }
          })  
            
          if(numAffectedRows)
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

