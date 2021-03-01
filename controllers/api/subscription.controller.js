
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;
var moment = require('moment')


  /**
  *@role Get Login Page
  *@Method POST
  *@author Saira Ansari
  */
  app.get('/', checkAuth,async (req, res) => {
    try {
      const findData = await SUBSCRIPTION.findAll({
        where :{status:1,companyId:req.parentCompany},
        include:[{model:SUBDURATION,required:true,attributes:['id','price','duration']},
        {model:USERSUB ,where:{status:1,userId:req.id},required:false,attributes:['id','amount','duration','durationId','startDate','endDate']},

      ]
      });
      if(findData.length>0) 
      responseHelper.post(res, appstrings.added_success, findData,200);
      else
      responseHelper.post(res, appstrings.no_record, null,204);

    } catch (e) {
        return responseHelper.error(res, e.message,400);

    }
  });

/**
*@role Purchase Plan
*/
app.post('/purchasePlan',checkAuth,async (req, res, next) => {
  const data = req.body;

  let responseNull=  commonMethods.checkParameterMissing([ data.subscriptionId,data.durationId,data.amount])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  

  try{


   var existData= await USERSUB.findOne({where:{userId:req.id,status:1}})
  

    var duration=0
var durationData= await SUBDURATION.findOne({where:{id:data.durationId}})  
if(durationData && durationData.dataValues)
{
  
  
  duration=durationData.dataValues.duration


var newDate = moment(new Date()).format("YYYY-MM-DD");
    var enddate = moment(new Date()).add(parseInt(duration), 'M').format("YYYY-MM-DD");
    //Create Plan 

var users=null
    if(!existData)
    {
     users = await USERSUB.create({
      subscriptionId: data.subscriptionId,
      userId: req.id,
      startDate: newDate,
      endDate: enddate,
      duration:duration,
      durationId:data.durationId,
      amount: data.amount,
      status: '1'
    });

  }


  else{
    users = await USERSUB.update({
      subscriptionId: data.subscriptionId,
      userId: req.id,
      startDate: newDate,
      endDate: enddate,
      duration:duration,
      amount: data.amount,
      durationId:data.durationId,
    },{where:{id:existData.dataValues.id}});

  }
    var findData =await SUBSCRIPTION.findOne({where:{id:data.subscriptionId}});
    if(findData)
    {
    const updatedResponse = await USER.update({
      userType: 4
      }, 
      {
      where : { 
        id: req.id
      
      }
    });
    if(updatedResponse)
    {
      return responseHelper.post(res, appstrings.plan_purchased);
    }
      
    else return responseHelper.post(res, appstrings.oops_something,null,400);
  }
  else
  return responseHelper.post(res, appstrings.no_record,null,204);
  }
  else
  return responseHelper.post(res, appstrings.no_record,null,204);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
})




module.exports = app;

//Edit User Profile
