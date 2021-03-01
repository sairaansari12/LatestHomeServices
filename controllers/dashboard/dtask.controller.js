
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;
const sequelize = require('sequelize');
const COUPANs = db.models.coupan
const CATEGORYs = db.models.categories
const moment = require('moment');
ORDERS.hasMany(ASSIGNMENT,{foreignKey: 'orderId'})
ASSIGNMENT.belongsTo(EMPLOYEE,{foreignKey: 'empId'})
//ASSIGNMENT
app.get('/',adminAuth, async (req, res, next) => {
  try{
    return res.render('admin/task/taskList.ejs');
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

app.get('/tracking',adminAuth, async (req, res, next) => {
  try{


var id=req.query.orderId
  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"task");
  }

    const findData = await ORDERS.findOne({
      attributes:['id','orderNo','trackingLatitude','trackingLongitude'],
      where :{companyId :req.companyId, id: id },
      include: [
        {model: ADDRESS , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,
        {model: COMPANY , attributes: ['companyName','latitude','longitude'] } ,

        {model: USERS , attributes: ['firstName','lastName','countryCode','phoneNumber','image'] } ,
        {model: ASSIGNMENT , attributes: ['id'],
        required: true,
        include: [{
          model: EMPLOYEE,
          attributes: ['id','firstName','lastName','countryCode','phoneNumber','image','currentLat','currentLong'],
          required: true
        }]
      
      } ,
      {model: ORDERSTATUS , attributes: ['statusName']}
        
      ]
      
            
      });

      console.log(JSON.parse(JSON.stringify(findData)))

    return res.render('admin/task/trackingTask.ejs',{data:findData});
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});


app.post('/list',adminAuth, async (req, res, next) => {
  
var newDate = moment(new Date()).format("YYYY-MM-DD");
  var params=req.body;
  var filterType =  'upcoming';
  var pstatus = ['0','1','3','6','7','8','9'];
  var where ={companyId:req.id}
  var page =1
  var limit =20


  if(params.filterType && params.filterType!="")filterType=params.filterType
  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

  try{
  if(filterType=="upcoming")
{

 where.serviceDateTime= { [Op.gte]: new Date()}
       
}


if(filterType=="inprogress")
{

   pstatus = ['3','6','7','8','9'];

}


if(filterType=="completed")
{

   pstatus = ['5'];

}


where.progressStatus= {[Op.in]: pstatus}


        var findData = await ORDERS.findAndCountAll({
          attributes:['id','orderNo','companyId','serviceDateTime','progressStatus'],
        order: [
          ['orderNo', 'DESC'],  
      ],
      where :where,
      offset:offset,limit:limit,
      distinct:true,

        include: [
        {model: ADDRESS , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] },
        {model: USER , required:true,attributes: ['id','firstName','lastName','countryCode','phoneNumber'] },
        {model: ORDERSTATUS , attributes: ['status','statusName'] },

        {
          model: ASSIGNMENT ,
          attributes: ['id','jobStatus'],
          required: true,
          include: [{
            model: EMPLOYEE,
            attributes: ['id','firstName','lastName','countryCode','phoneNumber','image'],
            required: false
        }]
      }]
    });
     
  

    return responseHelper.post(res, appstrings.success, findData);
  }
  catch(e)
  {
    return responseHelper.error(res, e.message, 400);

  }
});


module.exports = app;

//Edit User Profile
