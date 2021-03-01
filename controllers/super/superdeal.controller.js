
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

const COUPAN = db.models.coupan
const CATEGORY = db.models.categories
const DEAL = db.models.deals
DEAL.belongsTo(USERTYPE,{foreignKey: 'type',targetKey:'id'})

app.get('/',superAuth, async (req, res, next) => {
    
  try{
   
    //var newDate = moment(new Date()).format("MM/DD/YYYY");
    const findData = await DEAL.findAll({
      where: {
        companyId: req.companyId
      }
    });
    var types=await commonMethods.getUserTypes(req.id) 

    return res.render('super/deals/dealListing.ejs',{data:findData,types:types});
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }


});

app.post('/list',superAuth, async (req, res, next) => {
  try {
    var params=req.body
    var page =1
    var limit =50
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit

    var status =  params.status;
    var where = "";
    if(status == "")
    {
      where={
        companyId: req.companyId
      }
      var arrayofTaskId = ['1', '0'];
    }else{
      where={
        companyId: req.companyId,
        status: status
      }
      var arrayofTaskId = [status];
    }

    if( params.search != "" ){
      var findData = await DEAL.findAndCountAll({
        order: [
          ['createdAt', 'DESC'],  
        ],
        where :{
          companyId: req.companyId,
          status: {
            [Op.in]: arrayofTaskId
          } ,
          [Op.or]: [
            { 
              dealName: {
                [Op.like]: `%${params.search}%`
              }
            },
            { 
              code: { [Op.like]: `%${params.search}%` }
            }
          ]
        },
        offset: offset, limit: limit ,
      });
    }
    else
    {
      var findData = await DEAL.findAndCountAll({
        order: [
          ['createdAt', 'DESC'],  
        ],
       include:[ {
          model: USERTYPE,
          attributes: ['id','userType'],
          required: false
        }],
        where :where,
        group:['id'],
        distinct:true,
        offset: offset, limit: limit ,
      });
    }
     
    var userDtaa={}
    userDtaa.data=findData
    return responseHelper.post(res, appstrings.success, userDtaa);

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }
});


app.get('/add',superAuth, async (req, res, next) => {
    
  try{
  
    var types=await commonMethods.getUserTypes(req.id) 

    return res.render('super/deals/dealAdd.ejs',{types});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await DEAL.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await DEAL.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, params.status==0?"Deal "+appstrings.active_success:"Deal "+appstrings.inactive_success,updatedResponse);
             }
             else{
               return responseHelper.post(res, 'Something went Wrong',null,400);
    
             }
       
       }

       else{
        return responseHelper.post(res, appstrings.no_record,null,204);

      }

         }
           catch (e) {
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
});


app.post('/add',superAuth,async (req, res) => {
  try {
    const data = req.body;
    let responseNull= commonMethods.checkParameterMissing([data.name,data.code,data.discount])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
        icon = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

        ImageFile.mv(config.UPLOAD_DIRECTORY +"coupans/thumbnails/"+ icon, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.meessage, 400);   
        });
      }
    }

    const user = await DEAL.findOne({
      attributes: ['id'],

      where: {
        code: data.code,
      }
    });

    if (!user) {
      const users = await DEAL.create({
        dealName: data.name,
        usageLimit: data.usageLimit,
        code: data.code,
        discount: data.discount,
        validUpto:(data.validupto && data.validupto!="")?data.validupto:null,
        thumbnail: icon,
        icon: icon,
        type:data.type,
        dealText:data.dealText,
        description:data.description,
        companyId: req.companyId,
        status: '1'
       });
      if (users) {
        responseHelper.post(res, appstrings.add_coupan, null,200);
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


    let responseNull= commonMethods.checkParameterMissing([data.dealId,data.name,data.code,data.discount])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""

    if (req.files) {

        ImageFile = req.files.icon;    
        if(ImageFile)
        {
           icon = Date.now() + '_' + ImageFile.name;

        ImageFile.mv(config.UPLOAD_DIRECTORY +"coupans/thumbnails/"+ icon, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.meessage, 400);   
        });

      }
    
    }


    const user = await DEAL.findOne({
      attributes: ['id'],

      where: {
        id: data.dealId,
        companyId: req.companyId

      }
    });




    if (user) {
    
      if(icon=="") icon=user.dataValues.thumbnail


      const users = await DEAL.update({
        dealName: data.name,
        code: data.code,
        discount: data.discount,
        usageLimit: data.usageLimit,
        thumbnail: icon,
        icon:icon,
        type:data.type,
        dealText:data.dealText,
        description:data.description,
        companyId: req.companyId,
        validUpto:(data.validupto && data.validupto!="")?data.validupto:null
       },
       {where:{
        id: data.dealId
       }}
       
       
       
       );


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









app.get('/view/:id',superAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {
      let responseNull=  common.checkParameterMissing([id])
      if(responseNull) 
      { 
        req.flash('errorMessage',appstrings.required_field)
        return res.redirect(superadminpath+"deals");
      }
      const findData = await DEAL.findOne({
        where :{companyId :req.companyId, id: id }
      });
      

      var types=await commonMethods.getUserTypes(req.id) 

      return res.render('super/deals/viewDeal.ejs',{data:findData,types});
    }catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"deals");
    }
  });



app.get('/delete/:id',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"deals");
}

  try{
      const numAffectedRows = await DEAL.destroy({
      where: {
        id: req.params.id
      }
      })  
        
      if(numAffectedRows>0)
      {
       req.flash('successMessage',appstrings.delete_success)
      return res.redirect(superadminpath+"deals");

      }

      else {
        req.flash('errorMessage',appstrings.no_record)
        return res.redirect(superadminpath+"deals");
      }

    }catch (e) {
      //return responseHelper.error(res, e.message, 400);
      req.flash('errorMessage',appstrings.no_record)
      return res.redirect(superadminpath+"deals");
    }
});




module.exports = app;

//Edit User Profile
