const NOTIFICATION=db.models.notifications

const sequelize = require('sequelize')
 var cron = require('node-cron');
 var moment = require('moment')
 const Op = require('sequelize').Op;

 var nodemailer = require('nodemailer');



cron.schedule('30 06 * * *',  async() => {
   console.log('running a task every 6:30 AM ');
   var days=['sun','mon','tue','wed','thu','fri','sat']

   var dayCount=days[new Date().getDay()]
  try {
    var findData = await SCHEDULE.findAll({where: {dayParts:{[Op.not]: dayCount}}});
    findData=JSON.parse(JSON.stringify(findData))

for(var t=0;t<findData.length;t++)
{
  SCHEDULE.update(
     {slots: findData[t].permanentSlots},
      {where: {id:findData[t].id}});
 }


//Delete older Notifications

NOTIFICATION.destroy({where: {  createdAt: {[Op.lte]: moment().subtract(7, 'days').toDate()
}}
});


//UPDate Vendors rating
updateVendorsRating()
updateAppRating()

//Update Servcice RATINGS
updateServiceRating()

//UPdate Popularity

updateServicePopularity()

//Update Tiffin Popularity
updateServiceTiffinPopularity()

////Update Tiffin Popularity
updateTiffinRating()

updateEmpRating()
updateEmpPopularity()
updateRestroPopularity()
deleteChatMsgs();

checkExpiryPlans()
checkAdminExpiryPlans()

  } catch (e) {
    console.error(e.message)
  }

  });
   
  // cron.schedule('* * * * *',  async() => {
  //   console.log('running a task every Mins ')
  //   checkAdminExpiryPlans()

   
  // });

  cron.schedule('* */360 * * *',  async() => {
    console.log('running a task every 360 Mins ');
    try{
      var newDate = moment(new Date()).format("YYYY/MM/DD hh:mm:ss");


      var services = await SERVICES.findAll({
        attributes: ['id','name','icon','thumbnail','validUpto','offer','offerName','price','originalPrice','unit'],
        where: {
                 status: 1,
                 validupto: {
                  [Op.lt]: newDate
                },
               
        },
        order: [
          ['offer','DESC']
        ]
      })


      services=JSON.parse(JSON.stringify(services))
      for(var p=0;p<services.length;p++)
      {
      
        SERVICES.update( {price:services[p].originalPrice,
          offer: 0,offerName:'',validUpto:null},
          {where: {id: services[p].id}})
   
        }


    
   } catch (e) {
     console.error(e.message)
   }
 
   }); 



// cron.schedule('* * * * *', () => {
//   var newDate = moment(new Date()).subtract(10,'days');

//   console.log('Runing a job at 01:0`0 at America/Sao_Paulo timezone',newDate);
 
// }, {
//   scheduled: true,
//   timezone: "Asia/Kolkata"
// });


//Recent Added Company ande product Ratings
 

async function updateServiceRating()
{

  var products =  await SERVICERATINGS.findAll({
    attributes: ['serviceId'],
    group:['serviceId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(2, 'days').toDate()}}
  })
  
  
  
 
  if(products && products.length>0) 
    {
      products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var rating=0
          var count=0
  
  var dataRating= await commonMethods.getServiceAvgRating(products[k].serviceId)
  if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
  {rating=dataRating.dataValues.totalRating
    count=dataRating.dataValues.totalNoRating
   }


SERVICES.update({
    rating: rating,
    totalRatings: count
  },
  {
    where : {
    id: products[k].serviceId
  }
  });
  
}
    }
  }

  async function updateEmpRating()
{

  var products =  await STAFFRATINGS.findAll({
    attributes: ['empId'],
    group:['empId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(2, 'days').toDate()}}
  })
  
  
  
 
  if(products && products.length>0) 
    {
      products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var rating=0
          var count=0
  
  var dataRating= await commonMethods.getEmpAvgRating(products[k].empId)
  if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
  {rating=dataRating.dataValues.totalRating
    count=dataRating.dataValues.totalNoRating
   }


EMPLOYEE.update({
    rating: rating,
    totalRatings: count
  },
  {
    where : {
    id: products[k].empId
  }
  });
  
}
    }
  }

        
  async function updateTiffinRating()
{

  var products =  await TIFFRATINGS.findAll({
    attributes: ['tiffinId'],
    group:['tiffinId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(2, 'days').toDate()}}
  })
  
  
  
 
  if(products && products.length>0) 
    {
      products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var rating=0
          var count=0
  
  var dataRating= await commonMethods.getTiffinAvgRating(products[k].tiffinId)
  if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
  {rating=dataRating.dataValues.totalRating
    count=dataRating.dataValues.totalNoRating
   }


TIFFSERVICES.update({
    rating: rating,
    totalRatings: count
  },
  {
    where : {
    id: products[k].tiffinId
  }
  });
  
}
    }
  }

    


async function updateServicePopularity()
{

  var products =  await SUBORDERS.findAll({
    attributes: ['serviceId'],
    group:['serviceId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(1, 'days').toDate()}}
  })
  
  
 products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var popularityD=0
  
  var dataPop= await SUBORDERS.findOne({attributes:['serviceId', [sequelize.fn('COUNT', sequelize.col('serviceId')), 'count']],where:{serviceId:products[k].serviceId}})
  if(dataPop && dataPop.dataValues && dataPop.dataValues.count) 
  popularityD=parseInt(dataPop.dataValues.count)
    
  

  SERVICES.update(
      
    {
      popularity: popularityD},
   { where: {id:products[k].serviceId}
    
  }
    ) 
        }
  
    
}


async function updateEmpPopularity()
{

  var products =  await ASSIGNMENT.findAll({
    attributes: ['empId'],
    group:['empId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(1, 'days').toDate()}}
  })
  
  
 products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var popularityD=0
  
  var dataPop= await ASSIGNMENT.findOne({attributes:['empId', [sequelize.fn('COUNT', sequelize.col('empId')), 'count']],where:{empId:products[k].empId,jobStatus:[1,3]}})
  if(dataPop && dataPop.dataValues && dataPop.dataValues.count) 
  popularityD=parseInt(dataPop.dataValues.count)
    

  EMPLOYEE.update(

    {
      totalOrders: popularityD},
   { where: {id:products[k].empId}
    
  }
    ) 
        }
  
    
}

async function updateServiceTiffinPopularity()
{

  var products =  await TIFFORDERS.findAll({
    attributes: ['tiffinId'],
    group:['tiffinId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(1, 'days').toDate()}}
  })
  
  

  
 products=JSON.parse(JSON.stringify(products))

  
  for(var k=0;k<products.length;k++)
        {
          var popularityD=0
  
  var dataPop= await TIFFORDERS.findOne({attributes:['id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],where:{tiffinId:products[k].tiffinId}})
  if(dataPop && dataPop.dataValues && dataPop.dataValues.count) 
  popularityD=parseInt(dataPop.dataValues.count)
    
  

  TIFFSERVICES.update(
      
    {
      popularity: popularityD},
   { where: {id:products[k].tiffinId}
    
  }
    ) 
        }
  
    
}


async function updateVendorsRating()
{
  //RECENT added Ratings
  var vendors =  await COMPANYRATING.findAll({
    attributes: ['companyId'],
    group:['companyId'],

  where: {
    createdAt: {[Op.gte]: moment().subtract(2, 'days').toDate()}}
  })
  

  if(vendors) 
  {
    vendors=JSON.parse(JSON.stringify(vendors))

for(var k=0;k<vendors.length;k++)
      {
        var rating=0
        var fQlRating=0
        var ppRating=0
        var fQnRating=0
        var count=0

var dataRating= await commonMethods.getCompAvgRating(vendors[k].companyId)
if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
{rating=dataRating.dataValues.totalRating
  count=dataRating.dataValues.totalNoRating
  fQlRating=dataRating.dataValues.foodQuality 
  fQnRating=dataRating.dataValues.foodQuantity 
  ppRating=dataRating.dataValues.packingPres
}
 COMPANY.update({
  rating: rating,
  foodQualityRating: fQlRating,
  foodQuantityRating: fQnRating,
  packingPresRating: ppRating,
  totalRatings: count,
},
{
  where : {
  id: vendors[k].companyId
}
});


      }

  }






}


async function updateAppRating()
{

        

        const dataRating =  await APPRATINGS.findOne({
          attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating'],
          [sequelize.fn('count', sequelize.col('rating')), 'totalNoRating']],
        where: {
          rating:{[Op.not]:'0'}}
        })




if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
{rating=dataRating.dataValues.totalRating
  count=dataRating.dataValues.totalNoRating

 COMPANY.update({
  rating: rating,
  totalRatings: count,
},
{
  where : {
  id: config.PARENT_COMPANY
}
});
}


      
  



}

async function updateRestroPopularity()
{

  var products =  await ORDERS.findAll({
    attributes: ['companyId'],
    group:['companyId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(1, 'days').toDate()}}
  })
  
  
 products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var popularityD=0
          var popularityD24=0

  var dataPop= await ORDERS.findOne({attributes:['companyId', [sequelize.fn('COUNT', sequelize.col('companyId')), 'count']],where:{companyId:products[k].companyId}})
  if(dataPop && dataPop.dataValues && dataPop.dataValues.count) 
  popularityD=parseInt(dataPop.dataValues.count)
    
  
  var dataPop24= await ORDERS.findOne({attributes:['companyId', [sequelize.fn('COUNT', sequelize.col('companyId')), 'count']],
  where:{companyId:products[k].companyId, createdAt: {[Op.gte]: moment().subtract(1, 'days').toDate()}}
})
if(dataPop24 && dataPop24.dataValues && dataPop24.dataValues.count) 
  popularityD24=parseInt(dataPop24.dataValues.count)



  COMPANY.update(
      
    {
      totalOrders: popularityD,
      totalOrders24: popularityD24

    },
   { where: {id:products[k].companyId}
    
  }
    ) 
        }
  
    
}


async function deleteChatMsgs(){
  const groups= await groupa.findAll({
    attributes: ['id']
  });  
  if(groups){
    groups.map(async group=>{
      var message = await chatMessages.findOne({ 
        attributes: ['id'],
        where: {
          [Op.and]: [
            {
              groupId: group.id
            },
            {
              createdAt: {[Op.lte]: moment().subtract(7, 'days').toDate()},
            }
          ]
         },
         order: [
           ['createdAt', 'DESC']
          ],
      });
      if(message){
        chatMessages.destroy({
          where:{
            groupId : group.id
          }
        })
      }
    });
  } 
}







async function checkExpiryPlans()
{
  try{
    var newDate = moment(new Date()).format("YYYY-MM-DD");
    //Get Plan
    const getplan = await USERSUB.findAll({
      where: {
        status: '1',
        endDate: {
          [Op.lt]: newDate
        }
      }
    });
    var MainArray = [];
    for (var i = 0; i < getplan.length; i++) {
      var userId = users[i].UserId;
      var findData =await USER.findOne({where:{id:userId}});
      if(findData)
      {
        MainArray.push(userId);
        //Send Notification
        var notifPushUserData={
          title: "Subscription Expired",
          description: "Your Subscription has been expired.",
          token:findData.dataValues.deviceToken,  
          platform:findData.dataValues.platform,
          userId: userId,
          role: 3,
          notificationType: "Subscription Expire",
          status: "Expire",
        }
        commonNotification.sendNotification(notifPushUserData)
      }
    }
    if(MainArray.length > 0)
    {
       const updatedResponse = await USER.update({
        userType: '3'
        }, 
        {
        where : { 
          id: {
            [Op.in]: MainArray
          }
        }
      });
       //User Plan
      const updatedplanResponse = await USERSUB.update({
        status: '0'
        }, 
        {
          
            where : { 
              userId: {
                [Op.in]: MainArray
              }
            }
          });
        }
         console.log("Plan Expired");
      }
      catch (e) {
         console.error(e.message)
      }
      
    
}
async function checkAdminExpiryPlans()
{
  try{
    var newDate = moment(new Date()).format("YYYY-MM-DD");
    //Get Plan
    const getplan = await TRIALSUB.findAll({
      where: {
        status: '1',
        endDate: {
          [Op.lt]: newDate
        }
      }
    });
    var MainArray = [];
    for (var i = 0; i < getplan.length; i++) {
      var userId = getplan[i].adminId;
      var findData =await COMPANY.findOne({where:{id:userId}});
      if(findData)
      {
        MainArray.push(userId);
        //Send Notification
        var notifPushUserData={
          title: "Subscription/Trial Expired",
          description: "Your Subscription or trial has been expired.",
          token:findData.dataValues.deviceToken,  
          platform:findData.dataValues.platform,
          userId: userId,
          notificationType: "Subscription Expire",
          status: "Expire",
        }
        commonNotification.insertNotification(notifPushUserData)
      }
    }
    if(MainArray.length > 0)
    {
       await COMPANY.update({
        status: 0
        }, 
        {
        where : { 
          [Op.or]:[
      
            {id:{
              [Op.in]: MainArray
            }},
            {parentId:{
              [Op.in]: MainArray
            }}
           
      
            ]



          
        }
      });


       await USER.update({
        status: 0
        }, 
        {
        where : { 
          
            companyId:{
              [Op.in]: MainArray
            }}
      });

       //User Plan
      const updatedplanResponse = await TRIALSUB.update({
        status: '0'
        }, 
        {
          
            where : { 
              adminId: {
                [Op.in]: MainArray
              }
            }
          });
        }
         //console.log("Plan Expired");
      }
      catch (e) {
         console.error(e.message)
      }
      
    
}




//PRODUCT RATINGS








