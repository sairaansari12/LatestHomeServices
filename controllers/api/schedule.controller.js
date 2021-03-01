const express = require('express');
const app = express();
const db = require('../../db/db');
const config = require('config');
const Op = require('sequelize').Op;
var moment = require('moment')

const SCHEDULE = db.models.schedule

//Relations
//SCHEDULE.belongsTo(SERVICES,{foreignKey: 'serviceId'})

//Home API with cats and trending and banners


app.get('/getSchedule', checkAuth,async (req, res, next) => {
 // var bookings =req.query.bookings
  var serviceDate =req.query.serviceDate


  let responseNull=  commonMethods.checkParameterMissing([serviceDate])
   if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    
      try{

var days=['sun','mon','tue','wed','thu','fri','sat']

var q= new Date()
var m = q.getMonth()+1;
var d = q.getDay();
var y = q.getFullYear();

var todayData = new Date();
var date1=new Date(serviceDate)


console.log(todayData-date1)


var dayCount=days[date1.getDay()]
if(dayCount==undefined)        

return responseHelper.post(res,appstrings.wrong_format,null,400);


    var schedule = await SCHEDULE.findOne({
          where: {
            companyId: req.companyId,
            status: 1,
            dayParts :dayCount
          },

         
      })
      if(schedule)
      {
        
       var data=JSON.parse(JSON.stringify(schedule))


      var slotdata=JSON.parse(schedule.slots)


      var newSlosts=[]
      var currentTime=new Date().getHours()+":"+new Date().getMinutes()
        for(var t=0;t<slotdata.length;t++)
        {
          var slotTime=commonMethods.convertTime12to24(slotdata[t].slot)
          //console.log(">>>>>>>>",slotTime,date1,todayData,compare(todayData,date1))

          if(compare(todayData,date1)<0)
          
          
          {
           // newSlosts.push({slot:slotdata[t].slot,bookings :slotdata[t].bookings,status:0})
          }
else if(currentTime>slotTime && (compare(todayData,date1)==0))
{
  //newSlosts.push({slot:slotdata[t].slot,bookings :slotdata[t].bookings,status:0})
}
else{

if(parseInt(slotdata[t].bookings)>0)
    newSlosts.push({slot:slotdata[t].slot,bookings :slotdata[t].bookings, status:1})
    else newSlosts.push({slot:slotdata[t].slot,bookings :slotdata[t].bookings,status:2})
}
        }

        data['slots']=newSlosts
      return responseHelper.post(res, appstrings.success, data);
      
      }
        
       else return responseHelper.post(res,appstrings.no_record,null,204);
  
      }
      catch (e) {
        return responseHelper.error(res, e.message, 400);
      }
  
  });
 


  function compare(dateTimeA, dateTimeB) {
    dateTimeA.setHours(0,0,0,0)
    dateTimeB.setHours(0,0,0,0)

    var momentA = moment(dateTimeA,"DD/MM/YYYY");
    var momentB = moment(dateTimeB,"DD/MM/YYYY");

    //console.log(momentA,momentB)
    if (momentA < momentB) return 1;
    else if (momentA > momentB) return -1;
    else return 0;
}

module.exports = app;