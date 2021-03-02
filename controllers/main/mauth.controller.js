
const express = require('express');
const app     = express();
const hashPassword = require('../../helpers/hashPassword');
const COMPANY= db.models.companies
const Op = require('sequelize').Op;
const jwt = require('jsonwebtoken');




/**
*@role Get Login Page
*@Method POST
*@author Saira Ansari
*/
app.get('/', async (req, res, next) => {
    if(req.session.userDataMain){
       //var data=await  getDashboardData("2020-04-10","2020-04-17",null,null,req.session.companyId)
        return res.render(mainfilepath+'trial/trialListing.ejs',{data:null});

    }

    return res.render(mainfilepath+'dashboard/login.ejs');
});


app.get('/login', async (req, res, next) => {
  
  return res.render(mainfilepath+'/dashboard/login.ejs');
});

async function getDashboardData(fromDate1,toDate1,progressStatus1,filterName,companyId,parentCompany)
{
    try {
        
        var fromDate =  ""
        var toDate =  ""
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);


        var filterNameMain=[sequelize.literal(`DAY(createdAt)`), 'DAY']
        var pStatus= await commonMethods.getOrdersAllStatus(parentCompany);
        progressStatus = pStatus.map(user => user.status);
        if(progressStatus1 && progressStatus1!="")  progressStatus=[progressStatus1]
       
        orderWhere={companyId: companyId,progressStatus: { [Op.or]: progressStatus}}

       
       
        if(filterName && filterName!="")
        {
          if(filterName=="MONTH")  filterNameMain= [sequelize.literal(`MONTH(createdAt)`), 'MONTH']
          if(filterName=="YEAR")  filterNameMain= [sequelize.literal(`YEAR(createdAt)`), 'YEAR']
          if(filterName=="WEEK")  {
            
            filterNameMain= [sequelize.literal(`WEEK(createdAt)`), 'WEEK']
            orderWhere={companyId: companyId,
              progressStatus: { [Op.or]: progressStatus},
              createdAt: { [Op.lte]: lastDay,[Op.gt]: firstDay}
            }

        }

        if(filterName=="DAY")  {
            
          filterNameMain= [sequelize.literal(`DAY(createdAt)`), 'DAY']
          orderWhere={companyId: companyId,
            progressStatus: { [Op.or]: progressStatus},
            createdAt: { [Op.lte]: lastDay,[Op.gt]: firstDay}
          }

      }
        }



        paymentWhere={companyId: companyId,transactionStatus: { [Op.or]: progressStatus}}
        ratingWhere={companyId: companyId}
        top5Where={companyId: companyId}

        
       
        if(fromDate1)fromDate= Math.round(new Date(fromDate1).getTime())
        if(toDate1) toDate=Math.round(new Date(toDate1).getTime())
        
      
      if(fromDate1!="" && toDate1!="")
      {
        
        orderWhere={companyId: companyId,progressStatus: { [Op.or]: progressStatus},createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}
        top5Where={companyId: companyId,createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}
        paymentWhere={companyId: companyId,createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}
        ratingWhere={companyId: companyId,createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}

    
      }

      var ordersDataqDepth = await ORDERS.findAll({
        attributes: ['progressStatus','createdAt',
          [sequelize.fn('sum', sequelize.col('totalOrderPrice')), 'totalSum'],
          filterNameMain,
          [sequelize.fn('COUNT', sequelize.col('progressStatus')), 'count']],
          group: [filterNameMain],
           where :orderWhere
      });





      
          var ordersDataqDepthFull= await ORDERS.findAll({
            attributes: ['progressStatus',
              [sequelize.fn('sum', sequelize.col('totalOrderPrice')), 'totalSum'],
              [sequelize.fn('COUNT', sequelize.col('progressStatus')), 'count']],
              include:[{model:ORDERSTATUS,attributes:['statusName']}],
              where :{companyId: companyId,progressStatus: { [Op.or]: progressStatus}},
              group: ['progressStatus'],
          });
          

          var top5UserStat= await ORDERS.findAll({
            attributes: ['userId','orderNo',
              [sequelize.fn('SUM', sequelize.col('totalOrderPrice')), 'totalSum'],
              [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
              include:[{model:USER,required:true,attributes:['firstName','lastName','image','createdAt','countryCode','phoneNumber',]}],
              where :top5Where,
              group: ['userId'],
              order:[[sequelize.literal('count'),'DESC']],
              limit:5, offset:0
          });
          

          
          var ratings= await COMPANYRATING.findOne({
            attributes: ['rating',
              [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
              [sequelize.fn('COUNT', sequelize.col('rating')), 'count']],
              where:ratingWhere
          });
          
     
         






          var paymentDataqdepth = await PAYMENT.findAll({
            attributes: ['paymentState',
              [sequelize.fn('sum', sequelize.col('amount')), 'totalSum'],
              [sequelize.fn('COUNT', sequelize.col('transactionStatus')), 'count']],
            group: ['paymentState'],
            where :{companyId: companyId,createdAt: { [Op.lte]: lastDay,[Op.gt]: firstDay   }}});


      
          // var userDataqDepth = await USER.findAll({
          //   attributes: ['id','status',
          //   filterNameMain,
          //     [sequelize.fn('COUNT', sequelize.col('status')), 'count'],[sequelize.literal(`WEEK(createdAt)`), 'week'],
          //   ],
          //      group:['status',filterNameMain],
          //     where :userWhere});


          //targetSales

          var targetSales = await DOCUMENT.findOne({
            attributes: ['targetSales'],
             where :{companyId:companyId}});

          var productStat = await SERVICES.findOne({
            attributes: ['id',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
          where :ratingWhere});



//RatingsDatat

var dataRating=await commonMethods.getCompAvgRating(companyId) 
var ratingsData={}

if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
{rating=dataRating.dataValues.totalRating}
foodQuality=dataRating.dataValues.foodQuality
packingPres=dataRating.dataValues.packingPres
foodQuantity=dataRating.dataValues.foodQuantity





ratingsData.avgRating=rating
ratingsData.foodQuality=foodQuality
ratingsData.packingPres=packingPres
ratingsData.foodQuantity=foodQuantity






          var userDtaa={}
          userDtaa.ordersDataStat=JSON.parse(JSON.stringify(ordersDataqDepthFull))
          userDtaa.revenuAnalytics=ordersDataqDepth
          userDtaa.top5UserStat=top5UserStat
          userDtaa.ratingStat=ratings
          userDtaa.productStat=productStat
          userDtaa.paymentStat=paymentDataqdepth
          userDtaa.targetSales=targetSales
       userDtaa.ratingsData=ratingsData   
          // userDtaa.paymentDataStat=paymentDataqdepth
          // userDtaa.userDataStat=userDataqDepth
          // userDtaa.categoryDataStat=categoryDataq
           userDtaa.totalOrders=userDtaa.ordersDataStat.map(item => item.count).reduce(function(acc, val) { return acc + val; }, 0)
          
          
          
           userDtaa.totalRevenue=userDtaa.ordersDataStat.map(item => item.totalSum).reduce(function(acc, val) { return acc + val; }, 0)

           // userDtaa.totalStatCategory=userDtaa.categoryDataStat.map(item => item.count).reduce(function(acc, val) { return acc + val; }, 0)
         // userDtaa.totalStatPayment=userDtaa.paymentDataStat.map(item => item.count).reduce(function(acc, val) { return acc + val; }, 0)
          // userDtaa.totalStatUser=userDtaa.userDataStat.map(item => item.count).reduce(function(acc, val) { return acc + val; }, 0)
          // userDtaa.mainTotalOrder=(await ORDERS.findAll({where:{companyId:companyId}})).length
          // userDtaa.mainTotalUser=(await USER.findAll({where:{companyId:companyId}})).length
          // userDtaa.mainTotalPayment=(await PAYMENT.findAll({where:{companyId:companyId}})).length
          // userDtaa.mainTotalCategory=(await CATEGORY.findAll({where:{companyId:companyId}})).length

          return  userDtaa
      
        } catch (e) {
          console.log(e)
          return null
         // return responseHelper.error(res, e.message, 400);
        }
      

}



app.post('/dashboard', mainAuth,async (req, res, next) => {
  try{
    var params=req.body
    var data=await getDashboardData(params.fromDate,params.toDate,null,params.filterName,req.id,req.parentCompany)
    return responseHelper.post(res, appstrings.success,data,200);
  }
  catch(e)
  {
    return responseHelper.error(res, e.message);

  }
  
});
app.post('/login',async(req,res,next) => { 
  
    var params=req.body
        try{
            		const userData = await COMPANY.findOne({
            		where: {
                  email: params.email,
                  role:0,
                  status:1
            		}
                })  
                
                  
                if(userData)
               {
                

               
                const match = await hashPassword.comparePass(params.password,userData.dataValues.password);
        
                if (!match) {
                    req.flash('errorMessage',appstrings.invalid_cred)
                     return res.redirect(mainpath);
                }
                      
                
                var parentCompany=""
                // var parent=await commonMethods.getParentCompany(userData.dataValues.id)
                // if(parent && parent.dataValues)
                parentCompany=config.PARENT_COMPANY
                req.session.userDataMain = userData;
                req.session.roleMain = userData.dataValues.role;
                req.session.companyIdMain = userData.dataValues.id;
                req.session.userIdMain = userData.dataValues.id;
                req.session.parentCompanyMain = parentCompany;

                var currency =await commonMethods.getCurrency(userData.dataValues.id) 
                if(currency && currency.dataValues && currency.dataValues.currency) CURRENCY=currency.dataValues.currency
                adminRole = userData.dataValues.role;

                req.flash('successMessage',"Welcome, you are logged in successfully.");
               
               
                return res.redirect(mainpath);

                }  
                else    
                {  
                    req.flash('errorMessage',appstrings.invalid_cred);

                    return res.redirect(mainpath);

                }
 
                       
    }catch (e) {
            req.flash('errorMessage',e.message);
            return res.redirect(mainpath);

    //  return responseHelper.error(res, e.message, 400);
    }
});

/**
*@role Admin Dashboard
*@Method POST
*@author Saira Ansari
*/


/**
*@role Admin Dashboard
*@Method POST
*@author Saira Ansari
*/
app.get('/logout',async(req,res,next) => {
    req.session.destroy((err) => {
    if(err) {
        return console.log(err);
    }
   // req.flash('successMessage',"Logout Success.");
    //return res.redirect(mainpath);
    return res.render(mainfilepath+'dashboard/logout.ejs');

    });
});


app.post('/forgotPassword',async(req,res,next) => { 
  
  
  var params=req.body
  let responseNull= commonMethods.checkParameterMissing([params.email])

  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

      try{
             userData = await COMPANY.findOne({
            where: {
                email: params.email,
              }
              })  
                
              if(userData)
             {

              
                userData= JSON.parse(JSON.stringify(userData))


                  var number= Math.floor(Math.random()*(10000000-0+1)+10000000 )+"";
                  const newPassword = await hashPassword.generatePass(number);
                 var dataEmail={name: userData.companyName,password: number,app_name:config.APP_NAME}
                  commonNotification.sendForgotPasswordMail(userData.email,dataEmail)
                  await COMPANY.update({ password: newPassword}, {where: { id: userData.id}}) ;

              //  return responseHelper.post(res,
              //    appstrings.password_reset_success,
              //    null,200, )}  
              // else    
              // {  
              //     return responseHelper.post(res, appstrings.no_record,null,204);
              // }

              req.flash('successMessage',userData.email);
              return res.redirect(mainpath+"recoverPassword");
            }  
              else    
              {  
                  req.flash('errorMessage',appstrings.no_record);
                  return res.redirect(mainpath+"forgotPassword");
              }


                     
  }catch (e) {
      console.log(e)
        return responseHelper.error(res, e.message);

  //  return responseHelper.error(res, e.message, 400);
  }
});


app.post('/changePassword',mainAuth,async(req,res,next) => { 
  
    var params=req.body
    let responseNull= commonMethods.checkParameterMissing([params.oldPassword,params.newPassword])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

        try{
            	const userData = await COMPANY.findOne({
            	where: {
                  id: req.id,
            		}
            	  })  
                  
                if(userData)
               {
                
                const match = await hashPassword.comparePass(params.oldPassword,userData.dataValues.password);
        
                if (!match) {
                 return responseHelper.post(res, appstrings.inccorect_oldpass,null,400);

                }
                     
                else{

                    const newPassword = await hashPassword.generatePass(params.newPassword);
                    await COMPANY.update({ password: newPassword}, {where: { id: req.id}}) ; 
                    return responseHelper.post(res, appstrings.password_change_success,null,200);


                }
               

                }  
                else    
                {  
                    return responseHelper.post(res, appstrings.no_record,null,204);


                }
 
                       
    }catch (e) {
        console.log(e)
          return responseHelper.error(res, e.message);

    //  return responseHelper.error(res, e.message, 400);
    }
});

app.get('/changePassword',mainAuth, async (req, res, next) => {
   return res.render(mainfilepath+'dashboard/changePassword.ejs');
});

app.get('/recoverPassword', async (req, res, next) => {
  return res.render(mainfilepath+'dashboard/recoverPassword.ejs');
});

app.get('/forgotPassword', async (req, res, next) => {
  return res.render(mainfilepath+'dashboard/forgotPassword.ejs');
});

app.get('/dashboard', async (req, res, next) => {
  return res.render(mainfilepath+'dashboard/dashboard.ejs');
});
module.exports = app;

//Edit User Profile
