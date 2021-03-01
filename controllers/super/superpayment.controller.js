
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;
var moment = require('moment')

PAYMENT.belongsTo(USERS,{foreignKey: 'userId'})
PAYMENT.belongsTo(ORDERS,{foreignKey: 'orderId'})
COMISSION.belongsTo(COMPANY,{foreignKey: 'companyId'})



app.get('/',superAuth, async (req, res, next) => {
    
 try{
  var  restro =await COMPANY.findAll({where:{parentId:req.id}})

      return res.render('super/payment/paymentListing.ejs',{restro});

 }

    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.get('/setup',superAuth, async (req, res, next) => {
    
  try{

  var  restro =await COMPANY.findAll({where:{parentId:req.id}})

   return res.render('super/payment/setup.ejs',{restro});
 
  }
 
     catch (e) {
       return responseHelper.error(res, e.message, 400);
     }
 
 
 });

 app.post('/getPaymentSetup',superAuth, async (req, res) => {
    
  try{
var params=req.body
    
      let responseNull=  commonMethods.checkParameterMissing([params.companyId])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     


  var chargesData=await COMISSION.findOne({where:{companyId:params.companyId}})
  var payData=await PAYMENTSETUP.findOne({where:{companyId:params.companyId}})

  var userData={}
  userData.comissionData=chargesData
  userData.accountData=payData

  return responseHelper.post(res, appstrings.success, userData);
 
  }
 
     catch (e) {
       return responseHelper.error(res, e.message, 400);
     }
 
 
 });

 app.get('/comissionHistory',superAuth, async (req, res) => {
    
  try{
    var  restro =await COMPANY.findAll({where:{parentId:req.id}})


       return res.render('super/payment/comissionHistory.ejs',{restro});
 
  }
 
     catch (e) {
       return responseHelper.error(res, e.message, 400);
     }
 
 
 });
 app.get('/pending',superAuth, async (req, res) => {
    
  try{

    var  restro =await COMPANY.findAll({where:{parentId:req.id}})

       return res.render('super/payment/pendingComissions.ejs',{restro});
 
  }
 
     catch (e) {
       return responseHelper.error(res, e.message, 400);
     }
 
 
 });




 app.post('/updateComission',superAuth,async (req, res) => {
  try {
    const data = req.body;
   
    let responseNull= commonMethods.checkParameterMissing([data.companyId,data.chargesType,data.installments])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

    var response=null
    if(data.comisssionId && data.comisssionId!="")
    {

       response=await COMISSION.update({
          chargesPercent:data.charges,
          chargesAmount:data.fullAmount,
          chargesType:data.chargesType,
          installments:data.installments
        },{where:{id:data.comisssionId}})
      
    

  }

  else{
    response=await COMISSION.create({
      chargesPercent:data.charges,
      chargesAmount:data.fullAmount,
      chargesType:data.chargesType,
      installments:data.installments,
      companyId:data.companyId
    });
  }

  
    if(response)
    responseHelper.post(res, appstrings.update_success, null,200);



  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})

app.post('/list',superAuth, async (req, res, next) => {
  
try {
  var params=req.body
  var transactionStatus =  ['0','1','2']
  var fromDate =  ""
  var toDate =  ""
  var companyId =  ""
 var reqValue=false
 var where2={}

  var page =1
  var limit =50
  if(params.page) page=params.page
  if(params.limit) limit=parseInt(params.limit)
  var offset=(page-1)*limit
  if(params.companyId && params.companyId!="") companyId=params.companyId


 


  if(params.transactionStatus && params.transactionStatus!="")  transactionStatus=[params.transactionStatus]


  var where={
    transactionStatus: { [Op.or]: transactionStatus}
     }



 
  if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
  if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())
  

if(fromDate!="" && toDate!="")
{
  where= {
    
    transactionStatus: { [Op.or]: transactionStatus},
    createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
       }

     

      }

      if(params.search && params.search!="")
      {
   reqValue=true
   where2= {
          [Op.or]: [
            { 
              firstName: {
                [Op.like]: `%${params.search}%`
              }
            }
          ]
        }
      }


      if(companyId!="")
      where.companyId=companyId



      const findData = await PAYMENT.findAndCountAll({
        order: [
          ['createdAt', 'DESC'],  
      ],
      where :where,
      
      include: [
        {model: USER , 
          required:reqValue,
          where:where2,
          attributes: ['id','firstName','lastName',"phoneNumber","countryCode","email","image"]},       
        {model: ORDERS , attributes: ['id','createdAt','orderNo'],required:true},       

      
      ],
      distinct:true,
      offset: offset, limit: limit ,

    });


    var countDataq = await PAYMENT.findAll({
      attributes: ['transactionStatus','paymentState',
        [sequelize.fn('sum', sequelize.col('amount')), 'totalSum'],
        [sequelize.fn('COUNT', sequelize.col('transactionStatus')), 'count'],
       

      ],
      include: [
        {model: USER , 
          required:reqValue,
          where:where2,
          attributes: ['id']}       
      ],
      group: ['transactionStatus'],
    where :where});


    var escrowDataq = await PAYMENT.findAll({
      attributes: ['paymentState',
        [sequelize.fn('sum', sequelize.col('amount')), 'totalSum'],
        [sequelize.fn('COUNT', sequelize.col('paymentState')), 'count'],
       

      ],
      include: [
        {model: USER , 
          required:reqValue,
          where:where2,
          attributes: ['id']}       
      ],
      group: ['paymentState'],
    where :where});

    var userDtaa={}
    userDtaa.data=findData
    userDtaa.counts=countDataq
    userDtaa.escrow=escrowDataq


    return responseHelper.post(res, appstrings.success, userDtaa);

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }


});


app.post('/comissionHistory',superAuth, async (req, res, next) => {
  
  try {
    var params=req.body
    var paidType =  ['0','1','2']
    var fromDate =  ""
    var toDate =  ""
    var companyId =  ""

  
    var page =1
    var limit =50
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    if(params.companyId) companyId=params.companyId

    var offset=(page-1)*limit
  
  
    if(params.paidType && params.paidType!="")  paidType=[params.paidType]
  
    var where={
      paidType: { [Op.or]: paidType}
       }
  
  
    if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
    if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())
    
  
  if(fromDate!="" && toDate!="")
  
    where= {
      paidType: { [Op.or]: paidType},
      createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
         }

        
  

        if(params.search && params.search!="")
        {
    
         where={ [Op.or]: [
            {amount: {[Op.like]: `%${params.search}%`}},
            {charges: { [Op.like]: `%${params.search}%` }
          }
          ],
          paidType: { [Op.or]: paidType},
        }
    
      }
        

if(companyId!="")
where.companyId=companyId


        const findData = await COMISSIONHISTORY.findAndCountAll({
          order: [
            ['createdAt', 'DESC'],  
        ],
        where :where,
        offset: offset, limit: limit ,
  
      });
  
    
 
      return responseHelper.post(res, appstrings.success, findData);
  
    } catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }
  
  
  });

  app.post('/pendingComissions',superAuth, async (req, res, next) => {
  
    try {
      var params=req.body
  
    
      var page =1
      var limit =50
      if(params.page) page=params.page
      if(params.limit) limit=parseInt(params.limit)
  
       var  where={}

   
      
   
        if(params.search && params.search!="")
        {
    
         where={ [Op.or]: [
            {chargesPercent: {[Op.like]: `%${params.search}%`}},
            {chargesAmount: { [Op.like]: `%${params.search}%` }
          }
          ],
         
        }
    
      }

      if(params.installments && params.installments!="")
        where.installments=params.installments

     if(params.companyId) where.companyId=params.companyId

  
      var findData = await COMISSION.findAll({
        order: [
          ['createdAt', 'DESC'],  
      ],
      where:where,
     include:[{model:COMPANY,
      where:{parentId:req.id},
      attributes:['companyName','email','logo1','phoneNumber']}],


    });

  
   
        findData=JSON.parse(JSON.stringify(findData))
        var newDate = moment(new Date()).format("MM/DD/YYYY");

for(var k=0;k<findData.length;k++)
{

  var days=30
  if(findData[k].installments==1)days=120
  if(findData[k].installments==2)days=365

var comissionSet=await COMISSIONHISTORY.findOne({where:{companyId:findData[k].companyId},

  order: [
    ['createdAt', 'DESC'],  
],})
if(comissionSet && comissionSet.dataValues)
findData[k].lastDate=comissionSet.dataValues.createdAt
var date1=findData[k].lastDate
findData[k].nextDate=(new Date(( date1.getTime() + days * 86400000 )));

findData[k].payble=(findData[k].nextDate<=new Date())?true:false





          const payData = await PAYMENT.findOne({
            attribures:[sequelize.fn('sum', sequelize.col('amount')), 'amount'],
          where :{createdAt: {
            [Op.lte]: newDate
          },
        paymentState:1
        },
    
        });


if(payData && payData.dataValues)
var amount=payData.dataValues.amount
findData[k].totalAmount=amount

if(findData[k].chargesType==1)
var comission=((amount*findData[k].chargesPercent)/100).toFixed(2)

else
var comission=findData[k].chargesAmount

findData[k].comission=comission

findData[k].paidAmount=amount-comission

if(comission>=amount)
findData[k].payble=false




}

   
        return responseHelper.post(res, appstrings.success, findData);
    
      } catch (e) {
        console.log(e)
        return responseHelper.error(res, e.message, 400);
      }
    
    
    });
  

app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await PAYMENT.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

     
    const updatedResponse = await PAYMENT.update({
      transactionStatus: params.status,

       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, appstrings.success,null);
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

app.post('/setup',superAuth,async(req,res,next) => { 
    
  var params=req.body

  try{
      let responseNull=  commonMethods.checkParameterMissing([params.companyId,params.accountNo,params.acHolderName,params.branchIFSC])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     
    
      var updatedResponse=null
if(params.paymentId && params.paymentId!="")
{
  updatedResponse = await PAYMENTSETUP.update({merchantKey:params.mKey,
    accountNo:params.accountNo,
    acHolderName:params.acHolderName,
    branchIFSC:params.branchIFSC,
    branchName:params.branchName,


        },
      {where: {
         id: params.paymentId }
     });
     
    }
    else{
      updatedResponse = await PAYMENTSETUP.create({
        accountNo:params.accountNo,
    acHolderName:params.acHolderName,
    branchIFSC:params.branchIFSC,
    branchName:params.branchName,
        companyId:params.companyId
      });
      

    }
    
    
     if(updatedResponse)
           {
  
         return responseHelper.post(res, appstrings.success,null);
           }
           else{
             return responseHelper.post(res, appstrings.oops_something,400);
  
           }
     
  
    
       }
         catch (e) {
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});




module.exports = app;

