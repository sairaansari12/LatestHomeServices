
const express = require('express');
const faqCategory = require('../../db/models/faqCategory');
const app     = express();
const Op = require('sequelize').Op;


app.get('/',adminAuth, async (req, res, next) => {
    
    try {
        
        var category=await FAQCAT.findAll({where:{companyId:req.id}})
        return res.render('admin/faq/faqListing.ejs',{category});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/list',adminAuth,async (req, res, next) => {

  var params=req.body
  var where={}
  var category=""

   var page =1
   var limit =20
   var orderby='createdAt'
   var orderType='DESC'
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }



  if(params.page) page=params.page
  if(params.category) category=params.category

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit
  
  


    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {question: {[Op.like]: `%${params.search}%`}},
        {answer: { [Op.like]: `%${params.search}%` }},
        {language: { [Op.like]: `%${params.search}%` }
      }
      ],
    }

  }
    
  if(category!="")
  where.faqCategory= category

where.companyId= req.id 


    try{


      var services = await FAQ.findAndCountAll({
      where: where,
      order: [[orderby,orderType]],
      include:[{model:FAQCAT,as:'category',attributes:['catName']}],
      distinct:true,
      offset:offset,limit:limit,

      })



  


      return responseHelper.post(res, appstrings.success, services);

  

    }
    catch (e) {
      console.log(e)
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
    
           return responseHelper.post(res,   params.status==0?"FAQ "+appstrings.active_success:"FAQ "+appstrings.inactive_success,updatedResponse);
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


app.post('/addFaq',adminAuth,async (req, res) => {
  try {
    const data = req.body;
   var profileImage=""

    let responseNull= commonMethods.checkParameterMissing([data.categoryId,data.question,data.answer,data.language])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);




    const user = await FAQ.findOne({
      where: {
        question: data.question,

      }
    });



    if (!user) {
      
      const users = await FAQ.create({
        question: data.question,
        answer: data.answer,
        language: data.language,
        companyId: req.companyId,
        faqCategory: data.categoryId
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


app.post('/update',adminAuth,async (req, res) => {
  try {
    const data = req.body;
    var profileImage=""


    let responseNull= commonMethods.checkParameterMissing([data.categoryId,data.faqId,data.questionedit,data.answeredit,data.languageedit])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


   


    const user = await FAQ.findOne({
      where: {
        id:data.faqId,
        companyId: req.companyId

      }
    });



    if (user) {
      
    
      const users = await FAQ.update({
        question: data.questionedit,
        answer: data.answeredit,
        language: data.languageedit,
        companyId: req.companyId,
        faqCategory: data.categoryId

       },

      { where:
       {
id: data.faqId,
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

app.post('/addCategory',adminAuth, async (req, res, next) => {
  try {
    const params = req.body;
    

    let responseNull=  common.checkParameterMissing([params.category])
    if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);
  
   var response=FAQCAT.create({catName:params.category,companyId:req.id})
  if(response)
    return responseHelper.post(res, appstrings.success, null,200);
    else
    return responseHelper.post(res, appstrings.oops_something, null,400);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});


app.post('/deleteCategory',adminAuth,async(req,res,next) => { 
  let responseNull=  common.checkParameterMissing([req.body.id])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await FAQCAT.destroy({
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


app.post('/getCategory',adminAuth,async (req, res, next) => {



    try{


      var services = await FAQCAT.findAndCountAll({
        where: {companyId:req.id},
      order: [['createdAt','DESC']]

      })




      return responseHelper.post(res, appstrings.success, services);

  

    }
    catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }

});

app.get('/view/:id',adminAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { return responseHelper.error(res, e.message, null);
}


   
      const findData = await FAQ.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
    return responseHelper.post(res, appstrings.success,findData);
     // return res.render('admin/faq/viewFaq.ejs',{data:findData});



    } catch (e) {
      return responseHelper.error(res, e.message, null);
    }


 
});



app.get('/delete/:id',adminAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"faq");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await FAQ.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(adminpath+"faq");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(adminpath+"faq");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(adminpath+"faq");
        }
});




module.exports = app;

//Edit User Profile
