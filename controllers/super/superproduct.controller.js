
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;
const fs = require('fs');




app.post('/list',superAuth,async (req, res, next) => {

  var params=req.body
     var page =1
   var limit =20
   var itemType=[]
   var orderby='createdAt'
   var orderType='DESC'
   var companyId =""
   var category=''

   if(params.itemType && params.itemType!="") itemType=[params.itemType]
   if(params.lat) lat=parseFloat(params.lat)
   if(params.lng) lng=parseInt(params.lng)
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }
  if(params.companyId) companyId=params.companyId
  if(params.category) category=params.category



  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit
  
   var where= {
    itemType:  {[Op.or]: itemType},
    deleted:0,
    
    }

    


    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {name: {[Op.like]: `%${params.search}%`}},
        {description: { [Op.like]: `%${params.search}%` }},
        {price: { [Op.like]: `%${params.search}%` }
      }
      ],
      itemType:  {[Op.or]: itemType},
      deleted:0,
    }

  }
    
  
if(companyId!="")
where.companyId= companyId 
where.parentCompany= req.id 


    try{


      var services = await SERVICES.findAndCountAll({
        distinct:true,     
      include:[{model:CATEGORY,as:'category',
        attributes:['id'],
        where:{[Op.or]:[
          {connectedCat : {[Op.like]: '%' + category + '%'}},
          {id : {[Op.like]: '%' + category + '%'}}
    
    ]}},    {model:FILTERS,attributes:['filter','id']}
  ],
      where: where,
      offset:offset,limit:limit,
      order: [[orderby,orderType]],

      })




      var countDataq = await SERVICES.findAll({
        attributes: ['approve','id',
          [sequelize.fn('COUNT', sequelize.col('services.id')), 'count'],
        ],
        distinct:true,
        include:[{model:CATEGORY,as:'category',
        attributes:['id'],
        where:{[Op.or]:[
          {connectedCat : {[Op.like]: '%' + category + '%'}},
          {id : {[Op.like]: '%' + category + '%'}}
    
    ]}},
    {model:FILTERS,attributes:['filter','id']}
  
  
  ],
    where :where,
    group: ['approve'],
      });
  
      var userDtaa={}
      userDtaa.data=services
      userDtaa.counts=countDataq


      return responseHelper.post(res, appstrings.success, userDtaa);

  

    }
    catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }

});

app.get('/',superAuth, async (req, res, next) => {
  try {
    
    var  restro =await COMPANY.findAll({where:{parentId:req.id}})
    var pdata= await commonMethods.getAllParentCategories(req.id)

     return res.render('super/products/productListing.ejs',{restro,pdata});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
    
       const userData = await SERVICES.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await SERVICES.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res,params.status==0?"Product item "+appstrings.active_success:"Product item "+appstrings.inactive_success ,updatedResponse);
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

app.post('/approve',superAuth,async(req,res,next) => { 
    
  var params=req.body
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     
  
     const userData = await SERVICES.findOne({
       where: {
         id: params.id }
     });
     
     
     if(userData)
     {
     

  var status=0
  if(params.status=="0")  status=1
     const updatedResponse = await SERVICES.update({
       status: status,
       approve: status,

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

app.get('/view/:id',superAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"products/");
}
      var findData = await SERVICES.findOne({
      where :{id: id },
      include:[{model:FILTERS,attributes:['id','filter']}]

      

  
      });
      var  permissions =await PERMISSIONS.findOne({where:{companyId:req.id}})

      dataAddons=[]

    if(findData) {
      findData=JSON.parse(JSON.stringify(findData))
if(findData.addOnIds && findData.addOnIds!="")
       dataAddons=await SERVICES.findAll({
        attributes: ['id','name','productType','description','price','icon','thumbnail','type','price','duration','includedServices','excludedServices','createdAt','status','originalPrice','offer','offerName','rating','totalRatings','popularity','unit'],
         where: {
          id: { [Op.or]: findData.addOnIds},
         },
         include:[{model:FILTERS,attributes:['id','filter']}]

       });


   

      return res.render('super/products/viewProduct.ejs',{data:findData,addOns:dataAddons,permissions});
      }


        return res.redirect(superadminpath+"products/");

      


    } catch (e) {
      console.log(e)
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"products/");
    }


 
});

app.post('/delete',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.body.id])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await SERVICES.destroy({
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
           // return res.redirect(superadminpath+"category");
          }

        }catch (e) {
          return responseHelper.error(res, e.message, 400);
          //req.flash('errorMessage',appstrings.no_record)
          //return res.redirect(superadminpath+"category");
        }
});






module.exports = app;

//Edit User Profile
