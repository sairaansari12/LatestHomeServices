const express = require('express');
 const router = express.Router();
 const CATEGORY = db.models.categories
 const Op = require('sequelize').Op;

 var methods={
     
checkParameterMissing :   function(params)
{

for(var k=0;k<params.length;k++)
{

if(params[k]==undefined || params[k]=="")

{
 return true
 break;
}

if(k==params.lenth-1)
return false

}

},

 
replaceData: function(data,value)
{
var stringVal=data
stringVal=stringVal.replace(value,"")
stringVal=stringVal.replace("s","")

return stringVal.trim();

},
getAllParentCategories: function (companyId)
{

  const catData =  CATEGORY.findAll({
    attributes: ['id','name','description','icon','thumbnail','createdAt','status'],
    where: {
      parentId :'0',
      companyId:companyId,
      id:  {[Op.not]: '0'},
  
           },
          
    order: [
      ['orderby','ASC']
    ],
  });
  return catData;
},

getAllowedCategories: async function (parentCompany,companyId,role)
{

  var catData =  await CATEGORY.findAll({
    attributes: ['id','name','description','icon','thumbnail','createdAt','status'],
    where: {
      parentId :'0',
      companyId:parentCompany,
      id:  {[Op.not]: '0'},
  
           },
          
    order: [
      ['orderby','ASC']
    ],
  });

  catData=JSON.parse(JSON.stringify(catData))
  const permissions = await PERMISSIONS.findOne({
    where: {
      companyId:companyId }
  });
    for(var k=0;k<catData.length;k++)
    {

if(role==2)
{
if(permissions && permissions.dataValues && permissions.dataValues.pCategories )
{
if( !permissions.dataValues.pCategories.includes(catData[k].id))
delete catData[k]
} 
else delete catData[k]

    }
  }

  catData=  catData.filter(i => i)

  return catData;
},

getBusinessType: function (companyId)
{

  const catData =  BUSINESSTYPE.findOne({
    attributes: ['id','type','businessName'],
    where: {companyId:  companyId}
        
  });
  return catData;
},

getFilters: async function (companyId,category)
{

  const catData =  await FILTERS.findAll({
    where: {companyId:  companyId,categoryId:category}
        
  });
  return catData;
},


getParentCompany: function (companyId)
{

  const catData =  COMPANY.findOne({
    where: {id:  companyId}
        
  });
  return catData;
},



getLinks: function (companyId)
{

  const catData =  DOCUMENT.findOne({
    where: {companyId:  companyId}
        
  });
  return catData;
},

getAllCompanies: function (companyId)
{

  const catData =  COMPANY.findAll({
    attributes: ['id','companyName'],
    where: {
      status :1,
      parentId:  companyId
           },
          
    order: [
      ['companyName','ASC']
    ],
  });
  return catData;
},

getAllCategories: function (companyId)
{

  const catData =  CATEGORY.findAll({
    attributes: ['id','name','description','icon','thumbnail','createdAt','status'],
    where: {
      companyId: companyId,
      level :'1',
      id:  {[Op.not]: '0'},
  
           },
          
    order: [
      ['orderby','ASC']
    ],
  });
  return catData;
},


getServiceAvgRating :function(serviceId)
{
  const ratData =  SERVICERATINGS.findOne({
    attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating'],
    [sequelize.fn('count', sequelize.col('rating')), 'totalNoRating']
  
  ],
  where: {
    serviceId:  serviceId,rating:{[Op.not]:'0'}}
  })
  
  return ratData

},
getTiffinAvgRating :function(tiffinId)
{
  const ratData =  TIFFRATINGS.findOne({
    attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating'],
    [sequelize.fn('count', sequelize.col('rating')), 'totalNoRating']
  
  ],
  where: {
    tiffinId:  tiffinId,rating:{[Op.not]:'0'}}
  })
  
  return ratData

},

getUserTypes :async function(companyId)
{
  const data =  await USERTYPE.findAll({
  where: {
    companyId:  companyId,status:1}
  })
  
  return data

},

getRoleTypes :function(companyId)
{
  const data =  ROLETYPE.findAll({
  where: {
    companyId:  companyId,status:1}
  })
  
  return data

},


getRating:function(rating)
{
    var avgRating=""
    for(var k=0;k<5;k++)
{
if(rating-k>1)
avgRating=  avgRating+' <i class="mdi  font-20  text-warning mdi-spin mdi-star"></i>';

else{ if (rating-k>0) avgRating=  avgRating+'<i  class="mdi mdi-star font-20   text-warning mdi-spin "></i>'
else  avgRating=  avgRating+'<i class="mdi font-20  mdi-star text-secondary "></i>'
}


}
return avgRating;

},
getEmpAvgRating :function(empId)
{
  const ratData =  STAFFRATINGS.findOne({
    attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating'],
    [sequelize.fn('count', sequelize.col('rating')), 'totalNoRating']
  
  ],
  where: {
    empId:  empId}
  })
  
  return ratData
  

},

getEmpOrders :function(empId)
{
  const ratData =  ASSIGNMENT.findOne({
    attributes: [
    [sequelize.fn('count', sequelize.col('orderId')), 'totalOrders'],
  ],
  where: {
    empId:  empId,
  jobStatus:[1,3]
  }
  
  })
  
  return ratData

},

getUserInfo :function(userId,attributes)
{
  const ratData =  USER.findOne({
  attributes:attributes,
  where: {
    id:  userId}
  
  })
  
  return ratData

},


getCompAvgRating :function(companyId)
{
  const ratData =  COMPANYRATING.findOne({
    attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating'],
    [sequelize.fn('avg', sequelize.col('foodQuality')), 'foodQuality'],
    [sequelize.fn('avg', sequelize.col('foodQuantity')), 'foodQuantity'],
    [sequelize.fn('avg', sequelize.col('packingPres')), 'packingPres'],
    [sequelize.fn('count', sequelize.col('rating')), 'totalNoRating']],
  where: {
    companyId:  companyId,rating:{[Op.not]:'0'}}
  })
  
  return ratData

},

getCurrency: function(companyId)
{
  
    const currency =    DOCUMENT.findOne({attributes:['currency'],where :{companyId : companyId}})
    if(currency && currency.dataValues && currency.dataValues.currency) CURRENCY=currency.dataValues.currency
    return currency
  
},
 format:function (date) {

    var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = date.getDate();
    var m = strArray[date.getMonth()];
    var y = date.getFullYear();
    return '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y;
},

formatYYMMDD:function (date) {


 
    var d = date.getDate();
    var m = date.getMonth()+1;
    var y = date.getFullYear();
    
    var dateText= '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    if(dateText=="1970-01-01")
    return ""
    else dateText

},


formatAMPM:function (date) {

  var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var d = date.getDate();
  var m = strArray[date.getMonth()];
  var y = date.getFullYear();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y +" "+strTime;
},

getOrderStatus :async function(input)
{

  var pStatus= await ORDERSTATUS.findOne({where:{status:input}});

var status=""
 if(pStatus && pStatus.dataValues)

 status=pStatus.dataValues.statusName


  return status;
},

getOrdersAllStatus :async function(companyId)
{

  var pStatus= await ORDERSTATUS.findAll({
    where:{companyId:config.MAIN_ID},
    order: [
      ['status', 'ASC'],  
  ],
  
  
  });
  return pStatus;
},
short:function (data,length) {

    var returnString=""
    if(data!="" && data.length>length)
    {
        returnString=data.substring(data,length)+"...."

    }
    else{
        returnString=data
 
    }

    return returnString
},


 convertTime12to24 :function (time12h) {
  const [time, modifier] = time12h.split(' ');

  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
},



cretaeMainCategory:async function ()
{
var catData= await CATEGORY.findOne({where:{id:config.FOOD_ID}})
if(!catData)
{

  await CATEGORY.create({
    id:config.FOOD_ID,
    name: 'Food & Delivery',
    icon: 'pulav.jpeg',
    thumbnail: 'pulav.jpeg',
    companyId: 0,
    level:0,
    parentId :0

});
}
},

generateOrderStatus:async function ()
{
  var statusName=['Pending','Confirmed','Cancelled','Assigning service agent','Order cancelled by service partner','Completed',
  '','Service agent assigned','Service agent is on his way','Service agent is at your doorstep','Job Started']


  var catData= await ORDERSTATUS.findOne({where:{companyId:config.MAIN_ID}})
if(!catData)
{
  for(var k=0;k<statusName.length;k++)
  {
    if(statusName[k]!="")
    {
  await ORDERSTATUS.create({
    statusName:statusName[k],
    companyId: parentId,      
    status: k

  });
}
}

}
},

generateUserRoles:async function ()
{
  var statusName=['New','Active','Most Active','Member']


  var catData= await USERTYPE.findOne({where:{companyId:config.PARENT_COMPANY}})
if(!catData)
{
  for(var k=0;k<statusName.length;k++)
  {
   
  await USERTYPE.create({
    userType:statusName[k],
    companyId: config.PARENT_COMPANY,      
    id: k+1

  });

}

}
},




distance:function (lat1, lon1, lat2, lon2, unit) {

  //console.log(">>>>>>>>>>>>>>>>>>>>",lat1,lon1,lat2,lon2)
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
}
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist
},


 }


 module.exports=methods