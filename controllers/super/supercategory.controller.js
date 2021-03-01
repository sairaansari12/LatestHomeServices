
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

const CATEGORY = db.models.categories
const FAVOURITES = db.models.favourites
CATEGORY.hasOne(SERVICES,{foreignKey: 'categoryId'})





app.get('/main',superAuth, async (req, res, next) => {
  try {
    


    var catData =  await CATEGORY.findAll({
      attributes: ['id','parentId','name','description','icon','thumbnail','createdAt','status'],
      where: {companyId:[req.id],level:'0'},
    include:[{model:SERVICES,attributes:['categoryId']}],
    group:['name'],
      order: [
        ['orderby','ASC']
      ],
    });

    catData=JSON.parse(JSON.stringify(catData))
    for(var k=0;k<catData.length;k++)
    {
      const childData =  await CATEGORY.findAll({where:{parentId: catData[k].id}});

      console.log(childData.length>0)
if(childData.length>0)
catData[k].child=true
else catData.child=null

    }
    
    //return responseHelper.post(res, appstrings.success,catData,200);


    var pData =  await CATEGORY.findOne({
      attributes: ['id'],
      where: {parentId:'0'},
    });
    var parentId=""
    if(pData&& pData.dataValues)
    parentId=pData.dataValues.id
     return res.render('super/category/supercategories.ejs',{data :catData,parentId: parentId});



    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});


app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await CATEGORY.findOne({
         attributes:['id','parentId','name'],
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await CATEGORY.update({
         status: status,
    
       },
       {
        where : {
          
          [Op.or]:
          [{connectedCat:{
          [Op.like]: '%' + userData.dataValues.id + '%'     }  }
       , {id:userData.dataValues.id}]} 
      
      
      });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res,  params.status==0?"Category "+appstrings.active_success:"Category "+appstrings.inactive_success,updatedResponse);
             }
             else{
               return responseHelper.post(res, 'Something went Wrong',400);
    
             }
       
       }

       else{
        return responseHelper.post(res, appstrings.no_record,204);

      }

         }
           catch (e) {
             console.log(e)
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
});



app.post('/addMain',superAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.serviceName])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var thumbnail=""

    if (req.files) {

      
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name.replace(/\s/g, "");
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await CATEGORY.findOne({
      attributes: ['id'],

      where: {
        name: data.serviceName,
        companyId: req.companyId

      }
    });



    if (!user) {

    

      const users = await CATEGORY.create({
        name: data.serviceName,
        description: data.description,
        icon: thumbnail,
        thumbnail: thumbnail,
        companyId: req.id,
        level:0,
        connectedCat:"",
        parentId :0
    

       });


      if (users) {

        responseHelper.post(res, appstrings.add_service, null,200);
       
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


    let responseNull= commonMethods.checkParameterMissing([data.serviceId,data.serviceName])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var thumbnail=""

    if (req.files) {

    
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name.replace(/\s/g, "");
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await CATEGORY.findOne({
      attributes: ['id'],

      where: {
        id: data.serviceId,
        companyId: req.companyId

      }
    });




    if (user) {
    
      if(thumbnail=="") thumbnail=user.dataValues.thumbnail


      const users = await CATEGORY.update({
        name: data.serviceName,
        description: data.description,
        thumbnail: thumbnail,
        colorCode :data.colorCode

       },
       {where:{

        id: data.serviceId
       }}
       
       
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})


app.get('/view/:id',superAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"category");
}
      const findData = await CATEGORY.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   
      var cdata= await commonMethods.getAllParentCategories(req.companyId)

      return res.render('super/category/viewCategory.ejs',{data:findData,catData:cdata});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"category");
    }


 
});

app.post('/delete',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.body.id])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await CATEGORY.destroy({
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
          //eturn res.redirect(adminpath+"category");
        }
});


app.post('/getSubCat',superAuth,async(req,res,next) => { 
    
  var params=req.body
  var where={
    companyId: [req.companyId,req.parentCompany],
    parentId :params.category,
         }

         if(params.search && params.search!="")

        where={ 
          companyId: [req.companyId,req.parentCompany],
          parentId:params.category,
          [Op.or]: [
            { name: {[Op.like]: `%${params.search}%`}},
            {description: { [Op.like]: `%${params.search}%` }
          }
          ],
      }


  try{
      let responseNull=  commonMethods.checkParameterMissing([params.category])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    

      var  catData = await CATEGORY.findAll({
        attributes: ['id','parentId','name','description','icon','thumbnail','createdAt','status'],
        where: where,
        include:[{model:SERVICES,attributes:['categoryId']}],
        order: [
          ['orderby','ASC']
        ],
        group:['name']
      });
     



     if(catData)
     {
    

      catData=JSON.parse(JSON.stringify(catData))
      for(var k=0;k<catData.length;k++)
      {
        const childData =  await CATEGORY.findAll({where:{parentId: catData[k].id}});
    if(childData.length>0)
  catData[k].child=true
  else catData.child=null
  
  
      }
      console.log(catData)
      
         return responseHelper.post(res, appstrings.success,catData);
           }
           else{
             return responseHelper.post(res, appstrings.oops_something,null,400);
  
           }
     
  

       }
         catch (e) {
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});


module.exports = app;

//Edit User Profile
