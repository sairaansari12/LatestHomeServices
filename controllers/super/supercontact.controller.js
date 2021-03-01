
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;


CONTACTUS.belongsTo(USER,{foreignKey: 'userId'})


app.get('/',superAuth, async (req, res, next) => {
    
    try {
       
        return res.render('super/contactus/contactListing.ejs');



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});

app.post('/list',superAuth,async(req,res) => { 
  
    try {
      var params=req.body
       var fromDate =  ""
      var toDate =  ""
      var page =1
      var limit =50
      var orderby='createdAt'
      var orderType='ASC'
      if(params.page) page=params.page
      if(params.limit) limit=parseInt(params.limit)
      var offset=(page-1)*limit
    
      where={
        readStatus: { [Op.or]: ['0','1']}
         }

      if(params.orderByInfo &&   params.orderByInfo.orderby) {
        orderby=params.orderByInfo.orderby
        orderType=params.orderByInfo.orderType
    
      }
    
      

      if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
      if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())
      
    
    if(fromDate!="" && toDate!="")
    {
      where= {
        createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
      }
          }

          if(params.search && params.search!="")
          {
      
           where={ [Op.or]: [
              {query: {[Op.like]: `%${params.search}%`}},
              {email: { [Op.like]: `%${params.search}%` }},
              {phoneNumber: { [Op.like]: `%${params.search}%` }},
            ]
           
          
      
        }
    }
          
    
          const findData = await CONTACTUS.findAndCountAll({
           
          where :where,
          
          include: [
            {model: USER , attributes: ['id','firstName','lastName',"phoneNumber","countryCode","image"]},
          ],
          order: [[orderby,orderType]],
          offset: offset, limit: limit ,
          distinct:true,
  
        });
    
        
         
      
    
    
    
    
     
    
    
        return responseHelper.post(res, appstrings.success, findData);
    
      } catch (e) {
        console.log(e)
        return responseHelper.error(res, e.message, 400);
      }
    
    
    });






app.post('/delete',superAuth,async(req,res,next) => { 
   

    let responseNull=  common.checkParameterMissing([req.body.ids])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  
  
    try{
          //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
          const numAffectedRows = await CONTACTUS.destroy({
            where: {
              id: req.body.ids
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
  


  app.post('/read',superAuth,async(req,res,next) => { 
   
    var params=req.body

    let responseNull=  common.checkParameterMissing([params.ids,params.readStatus])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  
  
    try{
          //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
          const numAffectedRows = await CONTACTUS.update(
              
                  {readStatus:params.readStatus},{
            where: {
              id: params.ids
            }

        }
            )  
              
            if(numAffectedRows)
            {
           return responseHelper.post(res, appstrings.update_success,null,200);
          }
  
            else {
              return responseHelper.post(res, appstrings.oops_something,null,400);
             // return res.redirect(adminpath+"category");
            }
  
          }catch (e) {
            return responseHelper.error(res, e.message, 400);
            //req.flash('errorMessage',appstrings.no_record)
            //return res.redirect(adminpath+"category");
          }
  });
  


  app.post('/status',superAuth,async(req,res,next) => { 
   
    var params=req.body

    let responseNull=  common.checkParameterMissing([params.ids,params.ustatus])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  
  
    try{
          //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
          const numAffectedRows = await CONTACTUS.update(
              
                  {status:params.ustatus},{
            where: {
              id: params.ids
            }

        }
            )  
              
            if(numAffectedRows)
            {
           return responseHelper.post(res, appstrings.update_success,null,200);
          }
  
            else {
              return responseHelper.post(res, appstrings.oops_something,null,400);
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
