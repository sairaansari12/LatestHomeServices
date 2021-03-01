
const express = require('express');
const app = express();
const Op = require('sequelize').Op;
const moment = require('moment');

//Relations
SUBORDERS.belongsTo(SERVICES, { foreignKey: 'serviceId' })
ORDERS.belongsTo(db.models.address, { foreignKey: 'addressId' })
ASSIGNMENT.belongsTo(ORDERS, { foreignKey: 'orderId' })
ORDERS.hasMany(SUBORDERS, { foreignKey: 'orderId' })




app.post('/status', checkAuth, async (req, res, next) => {

  var params = req.body
  try {
    let responseNull = commonMethods.checkParameterMissing([params.id, params.status])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);



    var userData = await ORDERS.findOne({
      where: {
        id: params.id
      }
    });


    if (userData) {



      const updatedResponse = await ORDERS.update({
        progressStatus: params.status,

      },
        {
          where: {
            id: userData.dataValues.id
          }
        });

      if (updatedResponse) {
        var statusName = await commonMethods.getOrderStatus(params.status)


        if (params.status == "5") {
          ASSIGNMENT.update({ jobStatus: 3 }, { where: { empId: req.id, orderId: params.id } });
          ORDERS.update({ progressStatus: params.status }, { where: { id: userData.dataValues.id } });

          var notifPushUserData = {
            title: "Job completed ,Order No.- " + userData.orderNo,
            description: "Job with order No.- " + userData.orderNo + ' is completed by ' + req.userData.firstName + ' on  ' + commonMethods.formatAMPM(new Date),
            userId: userData.companyId, role: 2
          }
          commonNotification.insertNotification(notifPushUserData)
        }

        userData = JSON.parse(JSON.stringify(userData))
        var findData = await USER.findOne({ where: { id: userData.userId } });
        var notifPushUserData = {
          title: "Order No.- " + userData.orderNo + ' status is marked ' + statusName,
          description: "Order No.- " + userData.orderNo + ' status is marked ' + statusName + ' on ' + commonMethods.formatAMPM(new Date),
          token: findData.dataValues.deviceToken,
          platform: findData.dataValues.platform,
          userId: userData.userId, role: 3,
          orderId: userData.id,
          notificationType: "ORDER_STATUS", status: params.status
        }

        commonNotification.insertNotification(notifPushUserData)
        commonNotification.sendNotification(notifPushUserData)






        return responseHelper.post(res, appstrings.success, null);
      }
      else {
        return responseHelper.post(res, appstrings.oops_something, 400);

      }

    }

    else {
      return responseHelper.post(res, appstrings.no_record, 204);

    }

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }



});


app.get('/allStatus', checkAuth, async (req, res, next) => {

  try {


    var findData = await commonMethods.getOrdersAllStatus(req.parentCompany);



    if (findData) return responseHelper.post(res, appstrings.detail, findData, 200);

    else return responseHelper.post(res, appstrings.no_record, null, 204);





  } catch (e) {
    return responseHelper.error(res, e.message, 400);

  }



});


app.get('/list', checkAuth, async (req, res) => {

  var params = req.query
  // jobStatus = ['0','1','2','3']
  jobStatus = ['0', '1', '2']
  var page = 1
  var limit = 20
  if (params.page) page = params.page
  if (params.limit) limit = parseInt(params.limit)
  if (params.jobStatus && params.jobStatus != "") jobStatus = params.jobStatus.split(",")

  var newDate = moment(new Date()).format("MM/DD/YYYY");

  //console.log(">>>>>>>>",progressStatus)

  var where = {}
  if (params.jobStatus == "0")
    where = {
      serviceDateTime: {
        [Op.gte]: newDate,
      }
    }
  var offset = (page - 1) * limit
  try {
    var user = await ORDERS.findAll({
      order: [
        ['createdAt', 'DESC']],
      offset: offset, limit: limit,
      where: where,

      include: [
        {
          model: ASSIGNMENT, attributes: ['id', 'jobStatus'], required: true,
          where: {
            empId: req.id,

            jobStatus: { [Op.or]: jobStatus }
          }

        },
        { model: USERS, required: true, attributes: ['id', 'firstName', 'lastName', 'image', 'countryCode', 'phoneNumber'] },
        { model: ORDERSTATUS, attributes: ['statusName', 'status'] },
        { model: COMPANY, attributes: ['id', 'companyName', 'logo1', 'address1', 'latitude', 'longitude', 'rating'] },

        { model: ADDRESS, attributes: ['id', 'addressName', 'addressType', 'houseNo', 'latitude', 'longitude', 'town', 'landmark', 'city'] },
        {
          model: SUBORDERS, attributes: ['id', 'serviceId', 'quantity'],
          include: [{
            model: SERVICES,
            attributes: ['id', 'name', 'description', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration'],
            required: false
          }],
          required: true,
        },



      ],


    });
    user = JSON.parse(JSON.stringify(user))
    var jobStatus = await ORDERS.findOne({
      attributes: ['id'], where: { progressStatus: ['8', '9', '10'] }, include: [
        {
          model: ASSIGNMENT, attributes: ['id', 'jobStatus'], required: true,
          where: { empId: req.id, jobStatus: { [Op.or]: [1] } }
        }]
    });

    var currencySend = ""
    var currency = await commonMethods.getCurrency(req.companyId)
    if (currency && currency.dataValues && currency.dataValues.currency) currencySend = currency.dataValues.currency
    else currencySend = CURRENCY
    for (var t = 0; t < user.length; t++) {
      user[t].currency = currencySend
      var orderDate = new Date(user[t].createdAt)
      var today = new Date()
      var diffMins = diff_mins(today, orderDate); // milliseconds between now & Christmas

      if (diffMins < 30 && user[t].progressStatus < 5) user[t].cancellable = true
      else user[t].cancellable = false



      if (jobStatus && jobStatus.dataValues) user[t].jobInProgress = true
      else user[t].jobInProgress = false




    }

    return responseHelper.post(res, appstrings.detail, user);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});




app.get('/detail/:orderId', checkAuth, async (req, res) => {
  var orderId = req.params.orderId

  let responseNull = commonMethods.checkParameterMissing([orderId])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  try {
    var orderData = await ORDERS.findOne({
      where: { id: orderId },
      include: [
        { model: db.models.address, attributes: ['id', 'addressName', 'addressType', 'houseNo', 'latitude', 'longitude', 'town', 'landmark', 'city'] },
        { model: USERS, attributes: ['id', 'firstName', 'lastName', 'image', 'countryCode', 'phoneNumber'] },
        { model: ORDERSTATUS, attributes: ['statusName', 'status', 'parentStatus'] },

        { model: COMPANY, attributes: ['id', 'companyName', 'logo1', 'address1', 'latitude', 'longitude', 'rating'] },
        {
          model: SUBORDERS, attributes: ['id', 'serviceId', 'quantity'],
          include: [{
            model: SERVICES,
            attributes: ['id', 'name', 'description', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration', 'rating'],
            required: false
          }]
        },
        {
          model: ASSIGNMENT, attributes: ['id', 'jobStatus'],
          where: { jobStatus: [1, 3] },
          required: false,
          include: [{
            model: EMPLOYEE,
            attributes: ['id', 'firstName', 'lastName', 'countryCode', 'phoneNumber', 'image'],
            required: false
          }]



        },

      ]

    });
    if (orderData) {
      orderData = JSON.parse(JSON.stringify(orderData))
      var currency = await commonMethods.getCurrency(req.companyId)
      if (currency && currency.dataValues && currency.dataValues.currency)
        orderData.currency = currency.dataValues.currency
      else orderData.currency = CURRENCY


      //Order Isntruction
      var instructions = await INSTRUCTIONS.findOne({ where: { companyId: req.parentCompany } })
      var driverIns = []
      if (instructions && instructions.dataValues && instructions.dataValues.deliveryInstructions != "") {
        var inst = JSON.parse(instructions.dataValues.deliveryInstructions)

        for (var k = 0; k < inst.length; k++) {
          var array = (orderData.deliveryInstructions.includes(",")) ? orderData.deliveryInstructions.split(",") : [orderData.deliveryInstructions]
          if (array.includes(inst[k].id + ""))
            driverIns.push(inst[k].heading)
        }
      }


      orderData.deliveryInstructions = driverIns


      return responseHelper.post(res, appstrings.detail, orderData);


    }
    else return responseHelper.post(res, appstrings.no_record, null, 204);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

app.get('/feedbacklist', checkAuth, async (req, res) => {
  var params = req.body
  var page = 1
  var limit = 20
  if (params.page) page = params.page
  if (params.limit) limit = parseInt(params.limit)
  var offset = (page - 1) * limit


  try {
    var user = await STAFFRATINGS.findAll({
      attributes: ['id', 'rating', 'review', 'createdAt', 'orderId'],
      where: {
        empId: req.id
      },
      order: [
        ['createdAt', 'DESC']],
      offset: offset, limit: limit,

      include: [
        { model: ORDERS, attributes: ['id', 'orderNo', 'serviceDateTime'] },
        {
          model: USER,
          attributes: ['id', 'firstName', 'lastName', 'image'],
          required: false
        }
      ],

    });

    if (user.length > 0) {
      var data = {}
      data.ratings = user
      var rating = 0, count = 0, orders = 0
      var dataRating = await commonMethods.getEmpAvgRating(req.id)
      var dataOrders = await commonMethods.getEmpOrders(req.id)

      if (dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) {
        rating = dataRating.dataValues.totalRating
        count = dataRating.dataValues.totalNoRating

      }
      if (dataOrders && dataOrders.dataValues && dataOrders.dataValues.totalOrders) {
        orders = dataOrders.dataValues.totalOrders

      }

      data.avgRating = rating
      data.totalRating = count
      data.totalOrders = orders
      return responseHelper.post(res, appstrings.detail, data);
    }
    else return responseHelper.post(res, appstrings.no_record, null, 204);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});


app.get('/getCancelReasons', checkAuth, async (req, res) => {


  try {
    var findData = await CANCELREASON.findAll({
      where: {
        companyId: req.parentCompany,
        status: 1

      },
      order: [
        ['createdAt', 'DESC']]
    });

    if (findData.length > 0)
      return responseHelper.post(res, appstrings.detail, findData);
    else
      return responseHelper.post(res, appstrings.no_record, null, 204);

  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

app.post('/submitCancel', checkAuth, async (req, res) => {
  var params = req.body

  try {
    let responseNull = commonMethods.checkParameterMissing([params.orderId, params.reasonId])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);



    var userData = await ORDERS.findOne({
      where: {
        id: params.orderId
      }
    });


    if (userData) {



      const updatedResponse = await ASSIGNMENT.update({
        jobStatus: 2,
        cancellationReason: params.reasonId,
        otherReason: params.otherReason,

      },
        {
          where: {
            orderId: params.orderId,
            empId: req.id
          }
        });

      if (updatedResponse) {
        var reasonData = await CANCELREASON.findOne({ id: params.reasonId })

        var notifPushUserData = {
          title: "Assignment for  order No.- " + userData.orderNo + ' is cancelled by ' + req.userData.firstName + ' on ' + commonMethods.formatAMPM(new Date),
          description: "Assignment for  order No.- " + userData.orderNo + ' is cancelled by ' + req.userData.firstName + ' on  ' + commonMethods.formatAMPM(new Date) + ', Reason :' + reasonData.reason + "   " + (params.otherReason ? params.otherReason : ""),
          userId: userData.companyId, role: req.role
        }

        commonNotification.insertNotification(notifPushUserData)




        return responseHelper.post(res, appstrings.success, null);
      }
      else {
        return responseHelper.post(res, appstrings.oops_something, 400);

      }

    }

    else {
      return responseHelper.post(res, appstrings.no_record, null, 204);

    }

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }




});


app.post('/rejectJob', checkAuth, async (req, res) => {
  var params = req.body

  try {
    let responseNull = commonMethods.checkParameterMissing([params.id, params.orderId])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);



    var userData = await ORDERS.findOne({
      where: {
        id: params.orderId
      }
    });


    if (userData) {



      const updatedResponse = await ASSIGNMENT.destroy({

        where: {
          id: params.id,
          empId: req.id
        }
      });


      if (updatedResponse) {

        var notifPushUserData = {
          title: "Assignment Rejected for  order No.- " + userData.orderNo + ' on ' + commonMethods.formatAMPM(new Date),
          description: "Assignment for  order No.- " + userData.orderNo + ' is Rejected by ' + req.userData.firstName + ' on  ' + commonMethods.formatAMPM(new Date),
          userId: userData.companyId, role: 2
        }

        commonNotification.insertNotification(notifPushUserData)

        return responseHelper.post(res, appstrings.job_rejected, null);
      }
      else {
        return responseHelper.post(res, appstrings.oops_something, 400);

      }

    }

    else {
      return responseHelper.post(res, appstrings.no_record, null, 204);

    }

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }




});



app.post('/acceptJob', checkAuth, async (req, res) => {
  var params = req.body

  try {
    let responseNull = commonMethods.checkParameterMissing([params.id, params.orderId])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);



    var assignData = await ASSIGNMENT.findOne({
      where: {
        orderId: params.orderId,
        jobStatus: 1,

      }
    });



    await ORDERS.update({
      progressStatus: 7

    },
      {
        where: {
          id: params.orderId
        }
      });


    if (assignData && assignData.dataValues) {
      await ASSIGNMENT.destroy({

        where: {
          orderId: params.orderId,
          jobStatus: 0
        }
      });

      var userData = await ORDERS.findOne({
        where: {
          id: params.orderId
        }
      });

      var notifPushUserData = {
        title: "Job Accepted ,Order No.- " + userData.orderNo,
        description: "Assignment for  order No.- " + userData.orderNo + ' is Accepted by ' + req.userData.firstName + ' on  ' + commonMethods.formatAMPM(new Date),
        userId: userData.companyId, role: 2
      }
      commonNotification.insertNotification(notifPushUserData)



      if (userData && userData.dataValues) {
        userData = JSON.parse(JSON.stringify(userData))
        var findData = await USER.findOne({ where: { id: userData.userId } });
        var notifPushUserData = {
          title: "Order No.- " + userData.orderNo + ' is assigned to ' + req.userData.firstName,
          description: "Your order No.- " + userData.orderNo + ' is assigned to ' + req.userData.firstName + "- " + req.phoneNumber + ' on ' + commonMethods.formatAMPM(new Date),
          token: findData.dataValues.deviceToken,
          platform: findData.dataValues.platform,
          userId: userData.userId, role: 3,
          orderId: userData.id,
          notificationType: "ORDER_STATUS", status: userData.progressStatus
        }

        commonNotification.insertNotification(notifPushUserData)
        commonNotification.sendNotification(notifPushUserData)



      }





      return responseHelper.post(res, appstrings.jobs_action_performed, null, 400);
    }
    else {




      const updatedResponse = await ASSIGNMENT.update({
        jobStatus: 1
      },
        {
          where: {
            id: params.id
          }
        });


      if (updatedResponse) {

        await ASSIGNMENT.destroy({

          where: {
            orderId: params.orderId,
            jobStatus: 0
          }
        });

        return responseHelper.post(res, appstrings.job_accepted, null);
      }
      else {
        return responseHelper.post(res, appstrings.oops_something, null, 400);

      }

    }





  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }




});



app.post('/cashCollected', checkAuth, async (req, res) => {
  var params = req.body

  try {
    let responseNull = commonMethods.checkParameterMissing([params.amount, params.orderId])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);




    var userData = await ORDERS.findOne({
      where: {
        id: params.orderId
      }
    });


    if (userData) {
      const updatedResponse = await PAYMENT.update({
        transactionStatus: 1,
        paymentMode: "Cash",
      },
        {
          where: {
            orderId: params.orderId
          }
        }
      );


      STAFFWALLET.create({ empId: req.id, payType: 0, companyId: req.companyId, amount: params.amount, orderId: params.orderId })

      var staffValues = await EMPLOYEE.findOne({ attributes: ['walletBalance'], where: { id: req.id } });

      if (staffValues && staffValues.dataValues) {
        var oldBalnce = staffValues.dataValues.walletBalance
        var walletBalance = oldBalnce - parseFloat(params.amount)
        EMPLOYEE.update({ walletBalance: walletBalance }, { where: { id: req.id } })

      }



      if (updatedResponse)
        return responseHelper.post(res, appstrings.payment_success, null, 200);


      else {
        return responseHelper.post(res, appstrings.oops_something, null, 400);

      }
    }
    else
      return responseHelper.post(res, appstrings.no_record, null, 204);

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }


});

app.post('/cancel', checkAuth, async (req, res, next) => {
  const params = req.body;

  let responseNull = commonMethods.checkParameterMissing([params.orderId, params.cancellationReason])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  try {
    const orderData = await ORDERS.findOne({
      where: {
        id: params.orderId,
        progressStatus: 9
      }
    })

    if (orderData) {

        const updatedResponse = await ORDERS.update({
          progressStatus: 4,
          cancellationReason: params.cancellationReason
        },
        {
          where: {
            id: orderData.dataValues.id
          }
        });

        if (updatedResponse) {
          if(orderData.dataValues.paymentType == '2'){
            var amt = "-"+orderData.dataValues.amount
            await USERWALLET.create({
              amount: amt,
              companyId: orderData.dataValues.companyId,
              userId: orderData.dataValues.userId,
              orderId: orderData.dataValues.orderId
            })
          }
            
          orderData.dataValues.progressStatus = 4;
          orderData.dataValues.cancellationReason = params.cancellationReason;

          var notifPushUserData = {
            title: "Assignment for  order No.- " + orderData.dataValues.orderNo + ' is cancelled by service agent',
            description: "Assignment for  order No.- " + orderData.dataValues.orderNo + ' is cancelled'+ ', Reason :' +  params.cancellationReason,
            userId: orderData.dataValues.userId, role: 3
          }

          commonNotification.insertNotification(notifPushUserData)
          commonNotification.sendNotification(notifPushUserData)

          return responseHelper.post(res, appstrings.cancel_success, orderData);
        }
        else return responseHelper.post(res, appstrings.oops_something, null, 400);

      
    }

    else return responseHelper.post(res, appstrings.order_not_cancel, null, 204);


  }
  catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }

})


function diff_mins(dt2, dt1) {

  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff * 60));

}


module.exports = app;



//Edit User Profile
