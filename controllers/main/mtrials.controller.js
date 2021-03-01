
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;
const hashPassword = require('../../helpers/hashPassword');
const fs = require('fs');
var ejs = require('ejs');

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: 465,
    secure: true, // use SSL
    //service: 'gmail',a
    auth: {
        user: config.EMAIL_KEY,
        pass: config.EMAIL_PASS
    }
});





/**
*@role Get User Page
*/
app.get('/',mainAuth, async (req, res, next) => {
    
    try {
       

      
       return res.render(mainfilepath+'trial/trialListing.ejs');


      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});



app.post('/createTrial',async (req, res, next) => {
  const params = req.body;


  let responseNull=  commonMethods.checkParameterMissing([params.name,params.businessName, params.username,params.password])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  


  try{
		const data = await TRIALS.findOne({
		where:{
      [Op.or]:[
      
      {email:params.email},
      {phoneNumber:params.phoneNumber},
      {username:params.username},

      ]
    
    }
	  })  
      
    if(data)
    return responseHelper.post(res, appstrings.already_exists, null, 400);

   

else{

  const newPassword = await hashPassword.generatePass(params.password);

    const createResponse = await TRIALS.create({
      username: params.username,
      name: params.name,
      businessName: params.businessName,
      vendorType: params.vendorType,
      email: params.email,
      countryCode: params.countryCode,
      phoneNumber: params.phoneNumber,
      address: params.address,
      password:newPassword,
      password1:params.password,
      latitude:  params.latitude?params.latitude:"30.7017",
      longitude: params.longitude?params.longitude:"76.7569",
    status:0

      })  
      
      if(createResponse) 

      return responseHelper.post(res, appstrings.trial_placed, createResponse);

      else return responseHelper.post(res, appstrings.oops_something, null,400);

}


 }
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})


app.post('/test',async (req, res, next) => {
  const params = req.body;


 

  try{
		
      
    generateTrialPeriod("25cbf58b-46ba-4ba2-b25d-8f8f653e9f14")
    return responseHelper.post(res, appstrings.already_exists, null, 400);

   




 }
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})




app.post('/list',mainAuth,async (req, res, next) => {

  var params=req.body
  
   var page =1
   var limit =20
   var status=['0','1']
   var orderby='createdAt'
   var orderType='ASC'

   if(params.status && params.status!="") status=[params.status]
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }

  if(params.page) page=params.page

  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {
    companyId:req.id,
    status:  {[Op.or]: status}    
    }

 

   var where= {
    status:  {[Op.or]: status}    
    }

    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {name: {[Op.like]: `%${params.search}%`}},
        {businessName: { [Op.like]: `%${params.search}%` }},
        {email: { [Op.like]: `%${params.search}%` }},
        {phoneNumber: { [Op.like]: `%${params.search}%` }},
        {countryCode: { [Op.like]: `%${params.search}%` }},
        {address: { [Op.like]: `%${params.search}%` }}


      ],
      status:  {[Op.or]: status},
    }

  }
    
  

      


    try{


      var services = await TRIALS.findAndCountAll({
      where: where,
      order: [[orderby,orderType]],
      offset:offset,limit:limit,

      })



      return responseHelper.post(res, appstrings.success, services);

  

    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});



app.post('/status',mainAuth,async(req,res,next) => { 
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await TRIALS.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       
        var parentAvaialble=await COMPANY.findOne(
                
          {where:{
          [Op.or]:[
          
          {email:userData.dataValues.email},
          {phoneNumber:userData.dataValues.phoneNumber},
          ]
        
        }
        });




        if(parentAvaialble && params.status=="0")
        return responseHelper.post(res, appstrings.already_exists,null,400);



else{

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await TRIALS.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {

               if(params.status=="0") 
               
               {

               if(userData.dataValues.vendorType==2)
               generateSuperAdmin(userData.dataValues,req.id)
            else generateVendorAdmin(userData.dataValues,req.id)

               }

                return responseHelper.post(res, appstrings.success,updatedResponse);
              }
    
             
             else{
               return responseHelper.post(res, 'Something went Wrong',400);
    
        }
        
      }
      }
      else
        return responseHelper.post(res, appstrings.no_record,204);
      
    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
});



app.post('/add',mainAuth,async (req, res) => {

  try {
    const data = req.body;
    var profileImage="",idProof="",coverImage=""
    var assignedServices=[]


    let responseNull= commonMethods.checkParameterMissing([data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



    const user = await USERS.findOne({
      attributes: ['phoneNumber'],
      where: {
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
      }
    });



    if (!user) {



      if (req.files) {

        ImageFile = req.files.image;    
        if(ImageFile)
        {
          profileImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
  
        ImageFile.mv(config.UPLOAD_DIRECTORY +"users/images/"+ profileImage, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.meessage, 400);   
          });
  
      }

      ImageFile1 = req.files.idProof;    
      if(ImageFile1)
      {
        idProof = Date.now() + '_' + ImageFile1.name.replace(/\s/g, "");
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"employees/proofs/"+ idProof, function (err) {
          //upload file
          if (err)
          responseHelper.error(res, appstrings.err.meessage, 400);   
           });
    }
      

    ImageFile2 = req.files.coverImage;    
    if(ImageFile2)
    {
      coverImage = Date.now() + '_' + ImageFile2.name.replace(/\s/g, "");
    ImageFile2.mv(config.UPLOAD_DIRECTORY +"employees/images/"+ coverImage, function (err) {
        //upload file
        if (err)
        {
          console.log(err)
        return responseHelper.error(res, err.message, 400);   
        }
      });
  }



        }

      
      const users = await USERS.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        dob: data.dob,
        address: data.address,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        platform: 'web',
        image : profileImage,
        companyId: req.id
       });




      if (users) {

        responseHelper.post(res, appstrings.add_emp_success, null,200);
        //req.flash('successMessage',appstrings.add_emp_success);
        //return res.redirect(adminpath+"employees");


       
      }
     else 
      responseHelper.error(res, appstrings.oops_something, 400);

    }
      else  
      responseHelper.error(res, appstrings.already_exists, 400);

  } catch (e) {
     return responseHelper.error(res, e.message,400);
    //return req.flash('errorMessage',appstrings.oops_something)

  }

})



app.post('/delete',mainAuth,async(req,res,next) => { 
   

    let responseNull=  common.checkParameterMissing([req.body.id])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  
  
    try{
          //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
          const numAffectedRows = await TRIALS.destroy({
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
  


  async function generateSuperAdmin(trialData,parentId)
  {
    var vendorData= await COMPANY.findOne({where:{email:trialData.email}})

   if(!vendorData) 
   {const parentData = await COMPANY.create({
      companyName: trialData.businessName,
      email: trialData.email,
      address1: trialData.address?trialData.address:"NA",
      logo1:'company1.jpg',
      logo2:'company1.jpg',
      logo3:'',
      password:trialData.password,
      parentId: parentId,
      phoneNumber: trialData.phoneNumber,
      countryCode: trialData.countryCode,
      latitude: trialData.latitude,
      longitude: trialData.longitude,
      role:1
    });

if(parentData)
{

  sendEmail(trialData.email,trialData,2)
  generateVendors(trialData,parentData.dataValues.id)
  generateRoles(parentData.dataValues.id)
  generateUsers(trialData,parentData.dataValues.id,trialData.password)
  generateOrderStatus(parentData.dataValues.id)
  generateBanners(parentData.dataValues.id)
  generateInstructions(parentData.dataValues.id)
  generateEmployees(parentData.dataValues.id,trialData.username,trialData.password,"super")
  generateOffers(parentData.dataValues.id,"ADM")
generateTrialPeriod(parentData.dataValues.id)

}



   }


}


async function generateVendorAdmin(trialData,parentId)
{
  var vendorData= await COMPANY.findOne({where:{email:trialData.email}})

  if(!vendorData) 
  {
  const parentData = await COMPANY.create({
    companyName: trialData.businessName,
    email: trialData.email,
    address1: trialData.address?trialData.address:"NA",
    logo1:'company1.jpg',
    logo2:'company1.jpg',
    logo3:'',
    password:trialData.password,
    parentId: parentId,
    phoneNumber: trialData.phoneNumber,
    countryCode: trialData.countryCode,
    latitude: trialData.latitude,
    longitude: trialData.longitude,
    role:3
  });

if(parentData)
{

generateRoles(parentData.dataValues.id)
generateUsers(trialData,parentData.dataValues.id,trialData.password)
generateOrderStatus(parentData.dataValues.id)
generateBanners(parentData.dataValues.id)
generateInstructions(parentData.dataValues.id)
generateEmployees(parentData.dataValues.id,trialData.username,trialData.password,"super")
generateOffers(parentData.dataValues.id,"ADM")
generateProducts(parentData.dataValues.id)
sendEmail(trialData.email,trialData,1)
generateTrialPeriod(parentData.dataValues.id)



}
  }






}

async function generateTrialPeriod(parentId)
{
  var enddate=new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000))

  await TRIALSUB.create({
    adminId: parentId,
    startDate: new Date(),
    endDate: enddate,
    duration:"14 days",
    durationId:"",
    amount: "0",
    status: '1'
  });
}

async function generateVendors(trialData,parentId)
{

  var vendorData= await COMPANY.findOne({where:{parentId:parentId}})

if(!vendorData)
{
  for(var k=1;k<2;k++)
  {

  var vendorsResp=await COMPANY.create({
    companyName: trialData.businessName+" Vendor"+k,
    email:trialData.username+k+'v@yopmail.com',
    address1: '',
    logo1:'vendor'+k+'.jpg',
    logo2:'vendor'+k+'.jpg',
    logo3:'',
    password:trialData.password,
    parentId: parentId,
    phoneNumber: '123456789'+k,
    countryCode: trialData.countryCode,
    latitude: trialData.latitude,
    longitude: trialData.longitude,
    role:2
  });

  if(vendorsResp)
  {
    generateOffers(vendorsResp.dataValues.id,"REST")
    generateBanners(vendorsResp.dataValues.id)
    generateEmployees(vendorsResp.dataValues.id,vendorsResp.dataValues.email,vendorsResp.dataValues.password,"vendor")
    generateProducts(vendorsResp.dataValues.id)



  }

  

}
}
}



async function generateRoles(parentId)
{

  var staffData= await STAFFROLE.findOne({where:{companyId:parentId}})

  if(!staffData)
  {
 await STAFFROLE.create({
    userType: 'Dispatcher',
    companyId: parentId,
    roleId:'1'
  });

   await STAFFROLE.create({
    userType: 'Manager',
    companyId: parentId,
    roleId:'2'
  });
}


var useData= await USERTYPE.findOne({where:{companyId:parentId}})

if(!useData)
{

  var userType=['New','Active','Most Active','Pro Member']

  for(var k=0;k<userType.length;k++)
  {
  await USERTYPE.create({
    userType:userType[k],
    companyId: parentId,      
    id: (k+1)

  });
}

}
}



async function generateBanners(parentId)
{
  var bannersImg=['banner1.jpg','banner2.jpg','banner3.jpg']


  
var useData= await BANNERS.findOne({where:{companyId:parentId}})

if(!useData)
{

  for(var k=0;k<bannersImg.length;k++)
  {
  await BANNERS.create({
    name:"BANNER "+(k+1),
    companyId: parentId,      
    url: bannersImg[k],
    orderby:(k+1)

  });
}
}

}

async function generateEmployees(parentId,username,password,type)
{

var useData= await EMPLOYEE.findOne({where:{companyId:parentId}})

if(!useData)
{

  var date=new Date()
  var dob=new Date(date.getTime() - (7300 * 24 * 60 * 60 * 1000))

  for(var k=0;k<2;k++)
  {
    await EMPLOYEE.create({
      firstName: "STAFF"+k,
      email:type=="vendor"?username:"staff"+username+"@yopmail.com",
      address: '',
      phoneNumber: '121212121'+k,
      countryCode: '91',
      password: password,
      deviceToken: '',
      platform: '',
      dob:dob,
      role:1,
      image:'user'+(k+1)+'.jpg',
      companyId: parentId
    });
  
}
}

}

async function generateOffers(parentId,type)
{

var useData= await COUPAN.findOne({where:{companyId:parentId}})

if(!useData)
{
  var date=new Date()
  var validity=new Date(date.getTime() + (14 * 24 * 60 * 60 * 1000))

  for(var k=0;k<2;k++)
  {
    await COUPAN.create({
      name: "COUPON "+type+(k+1),
      type: 0,
      offerType: "coupon",
      usageLimit: 1,
      code: 'COUPON100'+k,
      discount: (k+1)*10,
      icon: 'coupon'+(k+1)+'.png',
      validupto: validity,
      thumbnail: 'coupon'+(k+1)+'.png',
      description: 'Use coupon code to redeem offers',
      companyId: parentId,
      minimumAmount: 100

    });
  
}
}

}


async function generateUsers(trial,parentId,pswd)
{
  // for(var k=1;k<2;k++)
  // {
    k=1

    var userData= await USER.findOne({where:{companyId:parentId}})

if(!userData)
{
 await USER.create({
    firstName: "USER"+k,
    email: trial.email,
    address: '',
    phoneNumber: trial.phoneNumber,
    countryCode: trial.countryCode,
    password: pswd,
    deviceToken: '',
    platform: '',
    companyId: parentId
  });

//}

}
}

async function generateInstructions(parentId)
{
 
  var pickup=[{"id":1,"heading":"Please send order outside restaurant","instruction":"I will call you upon reaching your location"},{"id":2,"heading":"Don't send cutlery","instruction":"We will inform the restaurant to save the plastic,Thankyou"},{"id":3,"heading":"Please don't send plastic bags with order.","instruction":"Please don't send plastic bags with order."},{"id":4,"heading":"Send Extra Oreganos","instruction":"Send Extra Oreganos"},{"id":5,"heading":"Send Extra Sauce Packs","instruction":"Send Extra Sauce Packs"}]
  var delivery=[{"id":1,"heading":"Please dont ring the bell","instruction":"Our FoodSpot Valet will call you upon reaching your location"},{"id":2,"heading":"Don't send cutlery","instruction":"We will inform the restaurant to save the plastic,Thankyou"}]
  var tip=[5,10,15,20]
  var cooking=[{"id":1,"heading":"Please send order outside restaurant","instruction":"I will call you upon reaching your location"}]

    var userData= await INSTRUCTIONS.findOne({where:{companyId:parentId}})

if(!userData)
{
   await INSTRUCTIONS.create({
    pickupInstructions: JSON.stringify(pickup),
    deliveryInstructions: JSON.stringify(delivery),
    cookingInstructions: JSON.stringify(cooking),
    tip: JSON.stringify(tip),
    companyId: parentId
  });

//}

}
}

async function generateProducts(parentId)
{

  var catData= await CATEGORY.findOne({where:{companyId:parentId}})
var items=[
  {name:"Noodle",image:"Noodle.jpg",itemType:"0",price:100,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
  {name:"Chocolate Cake",image:"chocolate_cake.jpg",itemType:"0",price:180,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
  {name:"Coffee",image:"coffee.jpg",itemType:"0",price:40,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
    {name:"French Fries",image:"french_fries.jpg",itemType:"0",price:120,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
      {name:"Gulab Jamun",image:"gulabjamun.jpg",itemType:"0",price:50,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
      {name:"Maggi",image:"maggi.png",itemType:"0",price:40,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
      {name:"Pizza-Veg",image:"Pizza.jpg",itemType:"0",price:170,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
      {name:"Pulav",image:"pulav.jpeg",itemType:"0",price:100,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
      {name:"Sandwitch",image:"sandwitch.jpg",itemType:"0",price:30,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
      {name:"TacoBell",image:"TacoBell.png",itemType:"0",price:120,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
      {name:"Boiled Egg",image:"boiled_egg.jpg",itemType:"1",price:50,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
      {name:"Chicken-Karahi",image:"Chicken.jpg",itemType:"1",price:100,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},
      {name:"Fried-Chicken",image:"fried_chicken.jpg",itemType:"1",price:180,description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English"},



]
if(!catData)
{

   var catgData=await CATEGORY.create({
    name: 'Main Dishes',
    description: '',
    icon: 'pulav.jpeg',
    thumbnail: 'pulav.jpeg',
    companyId: parentId,
    level:1,
    connectedCat:JSON.stringify([config.FOOD_ID]),
    parentId :config.FOOD_ID


   });

   if(catgData)
   {
for(var m=0;m<items.length;m++)
{
    await SERVICES.create({
      name: items[m].name,
      categoryId:catgData.dataValues.id,
      description: items[m].description,
      itemType: items[m].itemType,
      price: items[m].price,
      icon: items[m].image,
      thumbnail: items[m].image,
      companyId: parentId,
      originalPrice :items[m].price,
      productType:1,
      approve:1


     });

   }
  }





  var date=new Date()
  var validity=new Date(date.getTime() + (14 * 24 * 60 * 60 * 1000))

  for(var k=0;k<2;k++)
  {
    await COUPAN.create({
      name: "COUPON "+(k+1),
      type: 0,
      offerType: "coupon",
      usageLimit: 1,
      code: 'COUPON100'+k,
      discount: (k+1)*10,
      icon: 'coupon'+(k+1)+'.png',
      validupto: validity,
      thumbnail: 'coupon'+(k+1)+'.png',
      description: 'Use coupon code to redeem offers',
      companyId: parentId,
      minimumAmount: 100

    });
  
}
}


}
function sendEmail(toEmail,trialData,type)
{

  var dataS={}
  dataS.susername=trialData.email
  dataS.spassword=trialData.password1

  dataS.vusername=trialData.username+"1v@yopmail.com"
  dataS.vpassword=trialData.password1

  dataS.phoneNumber=trialData.phoneNumber
  dataS.name=trialData.name



  if(type==2)var index = fs.readFileSync('html/trialMulti.html', 'utf8');
  if(type==1) var index = fs.readFileSync('html/trialSingle.html', 'utf8');

  var renderedHtml = ejs.render(index,
    dataS);
  var mailOptions = {
      from: config.REMINDER_MAIL,
      to: toEmail,
      subject: "Trial Request",
      // forceEmbeddedImages: true,
      html: renderedHtml
  };
  transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
          console.log(error);
      }
  });


}

module.exports = app;

//Edit User Profile
