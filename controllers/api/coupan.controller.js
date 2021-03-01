const express = require('express');
const app = express();
const db = require('../../db/db');
const moment   = require('moment');

const Sequelize       = require('sequelize');
const Op             = require('sequelize').Op;
const COUPAN          = db.models.coupan;
const CART          = db.models.cart;
DEALS.belongsTo(COMPANY,{foreignKey: 'companyId'})


//////////////////////////////////////////////
///////////////////////// PromoCode Api //////
//////////////////////////////////////////////


//////////////////////////// Get Promo List API ////////////////
app.get('/getPromoList', checkAuth,async (req, res, next) => {
  try{
    var companyId=req.query.companyId
    compArray=[req.parentCompany]
    if(companyId && companyId!="")
    compArray.push(companyId)
    else{
    var compdata=await COMPANY.findAll({attributes:['id'],where:{parentId:req.parentCompany,status:1}});
    if(compdata.length>0) compArray=compdata.map(user => user.id);
     compArray.push(req.parentCompany)
    }
    var newDate = moment(new Date()).format("MM/DD/YYYY");
    var coupanData = await COUPAN.findAll({
      attributes: ['id','description','thumbnail','code','discount','validupto'],
      include:[{model:COMPANY,attributes:['companyName','id']}],
      where: {
        status :1,
        validupto: {
          [Op.gte]: newDate
        },
        companyId:compArray,
        type:{[Op.in] :['0',req.userData.userType]}
      }
    })
    
    if(coupanData){

      var data=[];
for(var k=0;k<coupanData.length;k++)
{
      var orderData= await ORDERS.findAll({
        where: {
          promoCode: coupanData[k].code,
          userId :req.id
        }
      });

if(coupanData[k].usageLimit>0 && !(orderData && orderData.length>0 && orderData.length>=parseInt(coupanData[k].usageLimit)))
{
data.push(coupanData[k])

}
}

//Deal of the day



var userInfo=await commonMethods.getUserInfo(req.id)


var dob=new Date(userInfo?userInfo.dob:"")
var anDate=new Date(userInfo?userInfo.anniversaryDate:"")


var newBCond=null
var newACond=null


if (sameDay( dob, new Date()))
  newBCond= { 'dealName': { [Op.like]: '%' + 'birthday' + '%' }}
if(sameDay(anDate,new Date()))
 newBACond= { 'dealName': { [Op.like]: '%' + 'anniverary' + '%' }}


where= {
  status :1,
companyId:compArray,
validupto: {
[Op.gte]: newDate
}}


if(newACond || newBCond)

where[Op.or]= [
  newACond,
  newBCond,  
    ]
 var newDate = moment(new Date()).format("MM/DD/YYYY");
 var deals = await DEALS.findAll({
  attributes: ['id','description','thumbnail','code','discount','validupto'],
  include:[{model:COMPANY,attributes:['companyName','id']
 }],
 where: where,
   
   offset: 0, limit: 5,
 })


if(deals && deals.length>0)
{

  coupanData= JSON.parse(JSON.stringify(coupanData))
  deals= JSON.parse(JSON.stringify(deals))

for(var k=0;k<deals.length;k++)
{


  coupanData.splice(0,0,deals[k])
}
}


if(coupanData.length>0) return responseHelper.post(res, appstrings.success,coupanData)
    else
 return responseHelper.post(res, appstrings.no_record,null,204);

}
 else  return responseHelper.post(res, appstrings.no_record,null,204);

  }
  catch(e){
    return responseHelper.error(res, e.message, 400);
  }
});


///////// Add Coupan /////////////////////////
app.post('/applyCoupan', checkAuth,async (req, res, next) => {
  try{
    const data    = req.body;
    let companyId = req.companyId;
    //Get Coupan Details

    let responseNull=  commonMethods.checkParameterMissing([data.promoCode])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  var newDate = moment(new Date()).format("MM/DD/YYYY");

     var coupanDetails = await COUPAN.findOne({
     attributes: ['id','code','discount','minimumAmount','usageLimit','companyId'],
      where: {
        code: data.promoCode,
        status :1,
        validupto: {
          [Op.gte]: newDate
        },
        type:{[Op.in] :['0',req.userData.userType]}


      }
    });

    if(coupanDetails==null)
    {
       coupanDetails = await DEAL.findOne({
        attributes: ['id','dealName','code','discount','usageLimit','companyId'],
         where: {
           code: data.promoCode,
           status :1,

           [Op.or]: [
            {validupto: {
              [Op.gte]: newDate
            }},
            {validupto:null},
    
            
    
            
          ],
           
           type:{[Op.in] :['0',req.userData.userType]}
   
         }
       });

    }
    if(coupanDetails)
    {

      var orderData= await ORDERS.findAll({
        where: {
          promoCode: data.promoCode,
          userId :req.id
        }
      });



if(orderData  && orderData.length>=coupanDetails.usageLimit)
return responseHelper.post(res, appstrings.exceeded_limit,null,400);



if(coupanDetails.dealName)
{
  var dob=new Date(req.userData.dob)
var anDate=new Date(req.userData.anniversaryDate)


var valid=0

if (sameDay( dob, new Date()) && coupanDetails.dealName=="birthday")
  valid= 1
if(sameDay(anDate,new Date()) &&  coupanDetails.dealName=="anniversary")
 valid=1

 if(coupanDetails.dealName=="restanniversary" || coupanDetails.dealName=="other")
  valid=1
}

if(valid==0)
return responseHelper.post(res, appstrings.invalid_coupan,null,400);

      //Cart Total Price
      const getcart = await CART.findOne({
       attributes: ['companyId',[Sequelize.fn('sum', Sequelize.col('orderTotalPrice')), 'totalPrice']
      ],
        where: {
          userId: req.id
        }
      });


      if(!(coupanDetails.companyId==getcart.dataValues.companyId ||  coupanDetails.companyId==req.parentCompany))
      return responseHelper.post(res, appstrings.vendor_specific_coupon,null,400);


      if(coupanDetails.minimumAmount && parseFloat(getcart.dataValues.totalPrice)<parseFloat(coupanDetails.minimumAmount))
      {
        return responseHelper.post(res, appstrings.minimum_limit,null,400);

      }
      let price = parseFloat(getcart.dataValues.totalPrice);
      let per   = parseFloat(coupanDetails.dataValues.discount);
      let discount_price = (price/100)*per;        // Get Percentage Amount
      let payableAmount  = price - discount_price;  //Payable Amount
      
      
      await CART.update({
        promoCode: coupanDetails.dataValues.code
      },
      {where : {userId: req.id}});

      var response={}
      response.totalAmount=price
      response.discountPrice=discount_price
      response.payableAmount = payableAmount
      response.coupanId= coupanDetails.dataValues.id,
      response.coupanCode= coupanDetails.dataValues.code,
      response.coupanDiscount= coupanDetails.dataValues.discount
      return responseHelper.post(res, appstrings.coupan_applied,response);

  
    }
    else
    {

      return responseHelper.post(res, appstrings.invalid_coupan,null,400);

      
    }
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});




///////// Add Coupan /////////////////////////
app.post('/removeCoupan', checkAuth,async (req, res, next) => {
  try{
    const data    = req.body;
    //Get Coupan Details

    let responseNull=  commonMethods.checkParameterMissing([data.promoCode])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
    var coupanDetails = await COUPAN.findOne({
     attributes: ['id','code','discount'],
      where: {
        code: data.promoCode,
        status :1

      }
    });

if(coupanDetails==null) 

{coupanDetails = await DEALS.findOne({
  attributes: ['id','code','discount'],
   where: {
     code: data.promoCode,
     status :1

   }
 });
}


   
    if(coupanDetails)
    {







      //Cart Total Price
      
      await CART.update({
        promoCode: ""
      },
      {where : {userId: req.id}});

     
      return responseHelper.post(res, appstrings.coupan_removed,null);

  
    }
    else
    {


    
  


      return responseHelper.post(res, appstrings.invalid_coupan,null,400);

      
    }
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

function sameDay( d1, d2 ){
  return  d1.getUTCMonth() == d2.getUTCMonth() &&
         d1.getUTCDate() == d2.getUTCDate();
}


module.exports = app;