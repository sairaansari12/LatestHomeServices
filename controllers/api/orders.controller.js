
const express = require('express');
const app = express();
const Op = require('sequelize').Op;
var dateFormat = require('dateformat');
var moment = require('moment');
var payumoney = require('payumoney-node');
payumoney.isProdMode(false);
payumoney.setKeys(config.MKEY, config.MSALT, config.MHEADER)
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

ORDERS = db.models.orders
const COUPAN = db.models.coupan;
const CART = db.models.cart
const SUBORDERS = db.models.suborders
const SCHEDULE = db.models.schedule

//Relations
SUBORDERS.belongsTo(SERVICES, { foreignKey: 'serviceId' })
ORDERS.belongsTo(ADDRESS, { foreignKey: 'addressId' })
ORDERS.belongsTo(COMPANY, { foreignKey: 'companyId' })
ORDERS.hasMany(SUBORDERS, { foreignKey: 'orderId' })
ORDERS.belongsTo(ORDERSTATUS, { foreignKey: 'progressStatus', targetKey: 'status' })
PAYMENT.belongsTo(ORDERS, { foreignKey: 'orderId' })
ORDERS.belongsTo(STAFFRATINGS, { foreignKey: 'id', targetKey: 'orderId' })




app.post('/create', checkAuth, async (req, res, next) => {
  const params = req.body;
  var paymentType = 1;

  var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

  var promoCodeApplied = ""
  let responseNull = commonMethods.checkParameterMissing([params.serviceDateTime, params.deliveryType, params.serviceCharges, params.companyId, params.usedLPoints, params.LPointsPrice])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  if (params.deliveryType == 1) {
    let responseNull = commonMethods.checkParameterMissing([params.addressId])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);
  }




  var nowDate = new Date();
  if (!(new Date(params.serviceDateTime) > nowDate)) {

    return responseHelper.post(res, appstrings.past_bookings_na, null, 400);

  }







  if (params.paymentType && params.paymentType != "")
    paymentType = params.paymentType

  try {
    const findData = await PAYMENT.findOne({
      where: { userId: req.id, transactionStatus: 2, paymentType: 1 }, order: [
        ['createdAt', 'DESC']
      ],
    })

    if (findData) {
      ORDERS.destroy({ where: { id: findData.dataValues.orderId } })
      SUBORDERS.destroy({ where: { orderId: findData.dataValues.orderId } })
      PAYMENT.destroy({ where: { orderId: findData.dataValues.orderId } })

    }



    //else{
    var date1 = new Date(params.serviceDateTime)
    var dayCount = days[date1.getDay()]
    var schedules = await SCHEDULE.findOne({ where: { companyId: params.companyId, dayParts: dayCount } })
    if (schedules) var slotdata = JSON.parse(schedules.dataValues.slots)
    else slotdata = []
    var day = dateFormat(new Date(params.serviceDateTime), "hh:MM");
    var startDate = moment(day, 'hh:mm')




    var slotsBookingsAlowed = 0
    var amPm = params.serviceDateTime.toLowerCase()

    for (var t = 0; t < slotdata.length; t++) {

      var endDate = moment(slotdata[t].slot, 'hh:mm')
      var minsDiff = endDate.diff(startDate, 'minutes')
      if ((amPm.includes("am") && slotdata[t].slot.toLowerCase().includes("am")) || (amPm.includes("pm") && slotdata[t].slot.toLowerCase().includes("pm"))) {
        if (minsDiff == 0) {
          slotsBookingsAlowed = slotdata[t].bookings
          break;
        }
      }

    }

    var cartData = await CART.findAll({ where: { companyId: params.companyId, userId: req.id } });
    if (cartData && cartData.length > 0) {


      //  console.log(">>>>>>>>>>>>>",cartData)
      var countDataq = await CART.findOne({
        attributes: ['id', 'promoCode', 'userId',
          [sequelize.fn('sum', sequelize.col('orderTotalPrice')), 'totalSum'],
          [sequelize.fn('sum', sequelize.col('quantity')), 'totalQuantity'],

        ],

        where: {
          companyId: params.companyId, userId: req.id

        }
      });




      cartData = JSON.parse(JSON.stringify(cartData))
      countDataq = JSON.parse(JSON.stringify(countDataq))

      if (parseInt(slotsBookingsAlowed) == 0)
        //if(parseInt(countDataq.slotsBookingsAlowed)>0)
        return responseHelper.post(res, appstrings.all_slots_full, null, 400);



      var orderPrice = countDataq.totalSum
      var discountPrice = 0
      var serviceCharges = (params.serviceCharges && params.serviceCharges != "") ? params.serviceCharges : 0
      var totalPrice = parseFloat(orderPrice) + parseFloat(serviceCharges)

      if (params.tip && params.tip != "")
        totalPrice = totalPrice + parseFloat(params.tip)


      if (params.LPointsPrice && params.LPointsPrice != "")
        totalPrice = totalPrice - (params.LPointsPrice)


      // Write APPLY PROMO CODE HERE//

      var coupanDetails = await COUPAN.findOne({
        attributes: ['id', 'code', 'discount'],
        where: {
          code: cartData[0].promoCode,
          status: 1

        }
      });



      if (coupanDetails == null) {
        coupanDetails = await DEAL.findOne({
          attributes: ['id', 'code', 'discount'],
          where: {
            code: cartData[0].promoCode,
            status: 1

          }
        });

      }

      if (coupanDetails) {

        let per = parseFloat(coupanDetails.dataValues.discount);
        discountPrice = (totalPrice / 100) * per;        // Get Percentage Amount
        totalPrice = totalPrice - discountPrice;  //Payable Amount
        promoCodeApplied = coupanDetails.dataValues.code
      }


      var cookingInstMedia = ""
      if (req.files) {
        ImageFile = req.files.cookingInstMedia;
        cookingInstMedia = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
        ImageFile.mv(config.UPLOAD_DIRECTORY + "cooking/" + cookingInstMedia, function (err) {
          //upload file
          if (err)
            responseHelper.error(res, err.message, 400)
          // return res.json(jsonResponses.response(0, err.message, null));
        });
      }




      //const cOrderData=null
      const cOrderData = await ORDERS.create({

        addressId: params.addressId ? params.addressId : "",
        serviceDateTime: params.serviceDateTime,
        orderPrice: orderPrice,
        serviceCharges: serviceCharges,
        offerPrice: discountPrice,
        promoCode: promoCodeApplied,
        totalOrderPrice: totalPrice,
        userId: req.id,
        companyId: params.companyId,
        deliveryType: params.deliveryType,
        tip: params.tip,
        cookingInstructions: params.cookingInstructions,
        cookingInstMedia: cookingInstMedia,
        deliveryInstructions: params.deliveryInstructions,
        pickupInstructions: params.pickupInstructions,
        LPointsPrice: params.LPointsPrice,
        usedLPoints: params.usedLPoints,
        paymentType: paymentType,
        createdAt: new Date()


      })

      if (cOrderData) {

        subOrdersEntry(cartData, cOrderData.dataValues.id, req.id, async function (data, error) {

          if (data) {
            paymentEntry(req.id, params.companyId, cOrderData.dataValues.id, totalPrice, paymentType)
            subtractBookingsCount(slotdata, countDataq.totalQuantity, params.serviceDateTime, dayCount, params.companyId)

            if (paymentType == '2') {
              sendNotification(req, cOrderData.dataValues.serviceDateTime, cOrderData.dataValues.totalOrderPrice, cOrderData.dataValues.id, 1, cOrderData.dataValues.companyId)
              UpdateLoyalityPoints(req.id, cOrderData.dataValues.usedLPoints, cOrderData.dataValues.companyId, cOrderData.dataValues.id)

            }
            //sendNotification(req,params,totalPrice,cOrderData.dataValues.id)
            updateUserTye(req.id)
            return responseHelper.post(res, appstrings.order_success, cOrderData);
          }
          else return responseHelper.post(res, error, null, 400);

        })

      }
      else return responseHelper.post(res, appstrings.oops_something, null, 400);





    }
    else return responseHelper.post(res, appstrings.no_item_cart, null, 204);




  }
  catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }

})

async function sendNotification(req, serviceDateTime, totalPrice, orderId, status, companyId) {


  var userData = await USER.findOne({ where: { id: req.id } });
  var countryCode = "", phoneNumber = ""
  if (userData && userData.dataValues) {
    phoneNumber = userData.dataValues.phoneNumber
    countryCode = userData.dataValues.countryCode

  }
  var notifData = null
  var notifUserData = null
  var notifPushUserData = null

  if (userData.dataValues.email && userData.dataValues.email != "")
    sendEmail(orderId, userData.dataValues.email)



  if (status == 1) {

    notifData = {
      title: appstrings.new_order_title + " " + commonMethods.formatAMPM(new Date(serviceDateTime)),
      description: appstrings.new_order_description + " " + commonMethods.formatAMPM(new Date(serviceDateTime)) + " Contact : +" + countryCode + " " + phoneNumber,
      userId: companyId,
      orderId: orderId,
      role: 2
    }

    notifUserData = {
      title: appstrings.order_placed1,
      description: appstrings.order_placed + " " + commonMethods.formatAMPM(new Date(serviceDateTime)) + ", Rs : " + totalPrice,
      userId: req.id,
      orderId: orderId,
      role: 3
    }

    notifPushUserData = {
      title: appstrings.order_placed1,
      description: appstrings.order_placed + " " + commonMethods.formatAMPM(new Date(serviceDateTime)) + ", Rs : " + totalPrice,
      token: userData.dataValues.deviceToken,
      orderId: orderId,
      platform: userData.dataValues.platform, notificationType: "ORDER_PLACED", status: 0,
    }


  }
  else {
    notifData = {
      title: appstrings.order_failed + " , Date: " + commonMethods.formatAMPM(new Date(serviceDateTime)),
      description: appstrings.order_failed + "  , Date: " + commonMethods.formatAMPM(new Date(serviceDateTime)) + ", Contact : +" + countryCode + " " + phoneNumber,
      userId: companyId,
      orderId: orderId,
      role: 2
    }

    notifUserData = {
      title: appstrings.order_failed_title,
      description: appstrings.order_failed + "  , Date: " + commonMethods.formatAMPM(new Date(serviceDateTime)) + " Rs : " + totalPrice,
      userId: req.id,
      orderId: orderId,
      role: 3
    }

    notifPushUserData = {
      title: appstrings.order_failed_title,
      description: appstrings.order_failed + " , Date : " + commonMethods.formatAMPM(new Date(serviceDateTime)) + " Rs : " + totalPrice,
      token: userData.dataValues.deviceToken,
      orderId: orderId,
      platform: userData.dataValues.platform, notificationType: "ORDER_FAILED", status: 0,
    }


  }

  commonNotification.insertNotification(notifData)
  commonNotification.insertNotification(notifUserData)
  commonNotification.sendNotification(notifPushUserData)

}

async function updateUserTye(userId) {
  var type = 1
  ORDERS.findAll({ where: { userId: userId } }).then(data => {
    if (data && (data.length > 0 && data.length < 6)) type = 2
    if (data && (data.length >= 6 && data.length < 15)) type = 3

    USER.update({ userType: type }, { where: { id: userId, userType: [0, 1, 2, 3] } })

  }).catch(err => {
    console.log(err)
  })



}

app.post('/status', checkAuth, async (req, res, next) => {

  var params = req.body
  var show = 0
  try {
    let responseNull = commonMethods.checkParameterMissing([params.id, params.status])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

    if (params.status == 5) show = 1


    var userData = await ORDERS.findOne({
      where: {
        id: params.id
      }
    });


    if (userData) {


      const updatedResponse = await ORDERS.update({
        progressStatus: params.status,
        userShow: show

      },
        {
          where: {
            id: userData.dataValues.id
          }
        });

      if (updatedResponse) {
        if (params.status == 5) {

          var empId = 0
          var assignedDatat = await ASSIGNMENT.findAll({ where: { orderId: userData.dataValues.id } })

          for (var k = 0; k < assignedDatat.length; k++) {
            if (assignedDatat[k].jobStatus == 1) {
              empId = assignedDatat[k].empId
              await ASSIGNMENT.update({ jobStatus: 3 }, { where: { empId: empId, orderId: userData.dataValues.id } });

            }
            else {

              await ASSIGNMENT.destroy({ where: { id: assignedDatat[k].id, jobStatus: [0, 2] } })
            }



          }






          userData = JSON.parse(JSON.stringify(userData))
          var findData = await USER.findOne({ where: { id: userData.userId } });
          var notifPushUserData = {
            title: userData.orderNo + appstrings.order_mark_complete,
            description: userData.orderNo + appstrings.order_mark_complete + ' on ' + commonMethods.formatAMPM(new Date),
            token: findData.dataValues.deviceToken,
            platform: findData.dataValues.platform,
            userId: userData.userId, role: 3,
            notificationType: "ORDER_STATUS", status: 5,
          }

          commonNotification.insertNotification(notifPushUserData)
          commonNotification.sendNotification(notifPushUserData)
        }
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

app.post('/paymentStatus', checkAuth, async (req, res, next) => {

  var params = req.body
  var paymentState = 0
  try {
    let responseNull = commonMethods.checkParameterMissing([params.orderId, params.status])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);


    var orderData = await ORDERS.findOne({
      where: {
        id: params.orderId,
      }
    });



    if (params.status == "1") {
      paymentState = 1
      CART.destroy({ where: { userId: req.id } })

      UpdateLoyalityPoints(req.id, orderData.dataValues.usedLPoints, orderData.dataValues.companyId, orderData.dataValues.id)
      sendNotification(req, orderData.dataValues.serviceDateTime, orderData.dataValues.totalOrderPrice, orderData.dataValues.id, 1, orderData.dataValues.companyId)
    }
    else {
      sendNotification(req, orderData.dataValues.serviceDateTime, orderData.dataValues.totalOrderPrice, orderData.dataValues.id, 2, orderData.dataValues.companyId)

    }

    const userData = await PAYMENT.findOne({
      where: {
        orderId: params.orderId,
        userId: req.id,
      }
    });


    if (userData) {



      const updatedResponse = await PAYMENT.update({
        userId: req.id,
        orderId: params.orderId,
        transactionStatus: params.status,
        paymentMode: params.paymentMode,
        transactionId: params.transactionId,
        paymentState: paymentState,
        updatedAt: new Date()

      },
        {
          where: {
            id: userData.dataValues.id
          }
        });

      if (updatedResponse) return responseHelper.post(res, appstrings.success, null);
      return responseHelper.post(res, appstrings.oops_something, 400);



    }

    else {



      const createdResponse = await PAYMENT.create({
        userId: req.id,
        companyId: orderData.dataValues.companyId,
        orderId: params.orderId,
        transactionStatus: params.status,
        paymentMode: params.paymentMode,
        transactionId: params.transactionId,
        paymentState: paymentState,
        amount: params.amount


      });
      if (createdResponse) return responseHelper.post(res, appstrings.success, null);
      return responseHelper.post(res, appstrings.oops_something, 400);

    }
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }



});


function paymentEntry(userId, companyId, orderId, amount, paymentType) {

  try {
    PAYMENT.create({

      userId: userId,
      companyId: companyId,
      orderId: orderId,
      amount: amount,
      paymentType: paymentType


    })

    if (paymentType == 2) {

      CART.destroy({ where: { userId: userId } })




    }




  }
  catch (e) { console.log(e) }



}


function subtractBookingsCount(slotdata, quantity, serviceDateTime, dayCount, companyId) {
  var countAMPM = 0
  var count = 0;
  var amPm = serviceDateTime.toLowerCase()
  var day = dateFormat(new Date(serviceDateTime), "hh:MM");
  var startDate = moment(day, 'hh:mm')
  for (var t = 0; t < slotdata.length; t++) {

    var endDate = moment(slotdata[t].slot, 'hh:mm')

    //console.log(day,'ENDDATE.................',endDate)

    var minsDiff = endDate.diff(startDate, 'minutes')
    //console.log("MINS Difference>>>>",minsDiff)
    if (minsDiff == 0) {

      if ((amPm.includes("am") && slotdata[t].slot.toLowerCase().includes("am")) || (amPm.includes("pm") && slotdata[t].slot.toLowerCase().includes("pm"))) {
        //console.log('SLOTS.................',slotdata[t].bookings,quantity)
        //slotsBookingsAlowed=slotdata[t].bookings
        var quantity = parseInt(slotdata[t].bookings) - parseInt(quantity)
        slotdata[t].bookings = quantity.toString()
      }

    }

  }


  //console.log("SLOTS are>>>>",JSON.stringify(slotdata))
  SCHEDULE.update({ slots: JSON.stringify(slotdata) }, { where: { companyId: companyId, dayParts: dayCount } })


}


async function subOrdersEntry(orderData, id, userId, callback) {
  try {
    for (var t = 0; t < orderData.length; t++) {



      //var dataCat=await SERVICE.findOne({attributes:['categoryId'],where:{id:orderData[t].serviceId}})
      await SUBORDERS.create({

        serviceId: orderData[t].serviceId,
        // categoryId: (dataCat&& dataCat.dataValues)?dataCat.dataValues.categoryId:"0",
        quantity: orderData[t].quantity,
        orderId: id,
        userId: userId


      })

      if (t == orderData.length - 1)
        callback("Success", null)
    }

  }
  catch (error) {
    callback(null, error.message)

  }
}

app.get('/list', checkAuth, async (req, res) => {

  var params = req.query
  var pStatus = await commonMethods.getOrdersAllStatus(req.parentCompany);
  progressStatus = pStatus.map(user => user.status);

  var page = 1
  var limit = 20
  if (params.page) page = params.page
  if (params.limit) limit = parseInt(params.limit)
  if (params.progressStatus && params.progressStatus != "") progressStatus = params.progressStatus.split(",")

  var offset = (page - 1) * limit

  try {
    var user = await ORDERS.findAll({
      where: {
        userId: req.id,
        progressStatus: { [Op.or]: progressStatus },

      },
      order: [
        ['createdAt', 'DESC']],
      offset: offset, limit: limit,

      include: [
        { model: COMPANY, attributes: ['companyName', 'latitude', 'longitude', 'logo1', 'rating', 'totalRatings'] },
        { model: ADDRESS, required: false, attributes: ['id', 'addressName', 'addressType', 'houseNo', 'latitude', 'longitude', 'town', 'landmark', 'city'] },
        { model: ORDERSTATUS, attributes: ['statusName', 'status'] },
        {
          model: PAYMENT, attributes: ['transactionStatus'], where: {
            [Op.or]: [

              { paymentType: 1, transactionStatus: 1 },
              { paymentType: 2 }
            ]

          }, requird: true
        },
        {
          model: SUBORDERS, attributes: ['id', 'serviceId', 'quantity'],
          include: [{
            model: SERVICES,
            attributes: ['id', 'name', 'description', 'productType', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration'],
            required: false
          }],

        },

      ],

    });
    user = JSON.parse(JSON.stringify(user))
    console.log("=====order list", req.id, user)

    for (var t = 0; t < user.length; t++) {

      var orderDate = new Date(user[t].createdAt)
      var today = new Date()
      var diffMins = diff_mins(today, orderDate); // milliseconds between now & Christmas

      if (diffMins < 30 && user[t].progressStatus < 5) user[t].cancellable = true
      else user[t].cancellable = false


      user[t].cookingInstructions = (user[t].cookingInstructions) ? user[t].cookingInstructions : undefined
      user[t].pickupInstructions = (user[t].pickupInstructions) ? user[t].pickupInstructions : undefined
      user[t].deliveryInstructions = (user[t].deliveryInstructions) ? user[t].deliveryInstructions : undefined


      //delete  user[t]['company'];

      var quantity = 0
      var quantityData = await SUBORDERS.findOne({
        attributes: [[sequelize.fn('sum', sequelize.col('quantity')), 'totalQuantity']],
        where: { orderId: user[t].id }
      })

      if (quantityData && quantityData.dataValues)
        quantity = quantityData.dataValues.totalQuantity

      user[t].totalQuantity = quantity;

      //check if user already rated this order
      var orderStatus = await SERVICERATINGS.findAll({
        where: {
          userId: req.id,
          orderId: user[t].id,

        },
      });
      if (orderStatus && orderStatus.length > 0) {
        user[t].isRated = true;
      } else {
        user[t].isRated = false;
      }

    }

    return responseHelper.post(res, appstrings.detail, user);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});




app.post('/reorder', checkAuth, async (req, res) => {

  var params = req.body
  var orderId = params.orderId

  let responseNull = commonMethods.checkParameterMissing([orderId])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  try {

    var orderData = await ORDERS.findOne({
      attributes: ['orderPrice', 'totalOrderPrice', 'userId', 'companyId', 'deliveryType'],
      where: { id: orderId },
      include: [
        {
          model: SUBORDERS, attributes: ['id', 'serviceId', 'quantity'],
          include: [{
            model: SERVICES,
            attributes: ['id', 'name', 'price'],
            where: { deleted: 0 },
            required: true
          }]
        }
      ]

    });

    if (orderData) {
      orderData = JSON.parse(JSON.stringify(orderData))
      for (var p = 0; p < orderData.suborders.length; p++) {

        var orderTotalPrice = parseFloat(orderData.suborders[p].service.price) * parseInt(orderData.suborders[p].quantity)

        var cartData = await CART.findOne({ where: { serviceId: orderData.suborders[p].serviceId, userId: req.id } })

        if (!cartData) {
          await CART.create({
            serviceId: orderData.suborders[p].serviceId,
            orderPrice: orderData.suborders[p].service.price,
            orderTotalPrice: orderTotalPrice,
            quantity: orderData.suborders[p].quantity,
            userId: req.id,
            companyId: orderData.companyId,
            deliveryType: orderData.deliveryType,

          })
        }

      }


      return responseHelper.post(res, appstrings.success, null);
    }

    else return responseHelper.post(res, appstrings.oops_something, null, 400);

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
        { model: ADDRESS, attributes: ['id', 'addressName', 'addressType', 'houseNo', 'latitude', 'longitude', 'town', 'landmark', 'city'] },
        { model: ORDERSTATUS, attributes: ['statusName', 'status', 'parentStatus'] },
        { model: COMPANY, attributes: ['companyName', 'logo1', 'rating', 'totalRatings', 'address1', 'latitude', 'longitude'], required: true },
        {
          model: SUBORDERS, attributes: ['id', 'serviceId', 'quantity'],
          include: [{
            model: SERVICES,
            attributes: ['id', 'name', 'productType', 'description', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration'],
            required: false
          }]


        },

        { model: STAFFRATINGS, attributes: ['rating', 'review'] },
        {
          model: ASSIGNMENT, attributes: ['id', 'jobStatus'],
          where: { jobStatus: [1, 3] },
          required: false,
          include: [{
            model: EMPLOYEE,
            attributes: ['id', 'firstName', 'lastName', 'countryCode', 'phoneNumber', 'image', 'rating', 'totalRatings', 'totalOrders'],
            required: false
          }]
        }

      ]

    });
    if (orderData) {

      orderData = JSON.parse(JSON.stringify(orderData))

      //Order Isntruction
      var instructions = await INSTRUCTIONS.findOne({ where: { companyId: req.parentCompany } })
      var driverIns = []
      var pickupIns = []

      if (instructions && instructions.dataValues && instructions.dataValues.deliveryInstructions != "") {
        var inst = JSON.parse(instructions.dataValues.deliveryInstructions)

        for (var k = 0; k < inst.length; k++) {
          var array = (orderData.deliveryInstructions.includes(",")) ? orderData.deliveryInstructions.split(",") : [orderData.deliveryInstructions]
          if (array.includes(inst[k].id + ""))
            driverIns.push(inst[k].heading)
        }
      }


      if (instructions && instructions.dataValues && instructions.dataValues.pickupInstructions != "") {
        var inst = JSON.parse(instructions.dataValues.pickupInstructions)

        for (var k = 0; k < inst.length; k++) {
          var array = (orderData.pickupInstructions.includes(",")) ? orderData.pickupInstructions.split(",") : [orderData.pickupInstructions]
          if (array.includes(inst[k].id + ""))
            pickupIns.push(inst[k].heading)
        }
      }

      orderData.deliveryInstructions = driverIns
      orderData.pickupInstructions = pickupIns


      return responseHelper.post(res, appstrings.detail, orderData);


    }
    else return responseHelper.post(res, appstrings.no_record, null, 204);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

app.get('/instructions', checkAuth, async (req, res) => {
  var deliveryType = req.query.deliveryType
  var companyId = req.query.companyId

  let responseNull = commonMethods.checkParameterMissing([deliveryType, companyId])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  try {
    const orderData = await INSTRUCTIONS.findOne({
      where: { status: 1, companyId: req.parentCompany },
    });
    // console.log("======instructions", orderData)
    if (orderData) {
      if (deliveryType == "0") {
        orderData.tips = null
      }
      return responseHelper.post(res, appstrings.detail, orderData);

    }
    else return responseHelper.post(res, appstrings.no_record, null, 204);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

app.post('/cancel', checkAuth, async (req, res, next) => {
  const params = req.body;


  let responseNull = commonMethods.checkParameterMissing([params.orderId])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  try {
    const orderData = await ORDERS.findOne({
      where: {
        id: params.orderId,
        userId: req.id
      }
    })

    if (orderData) {

      var orderDate = new Date(orderData.dataValues.createdAt)
      var today = new Date()
      var diffMins = diff_mins(today, orderDate);
      if (orderData.progressStatus != 10 && diffMins > 15)
        return responseHelper.post(res, appstrings.order_not_cancel, null, 400);

      else {

        const updatedResponse = await ORDERS.update({
          progressStatus: 2,
          cancellationReason: params.cancellationReason
        },
        {
          where: {
            id: orderData.dataValues.id
          }
        });

        if (updatedResponse) {
          if(orderData.dataValues.paymentType == '1')
            refundAmount(orderData.dataValues.id, req.id)

          orderData.dataValues.progressStatus = 3
          orderData.dataValues.cancellationReason = params.cancellationReason

          return responseHelper.post(res, appstrings.cancel_success, orderData);
        }
        else return responseHelper.post(res, appstrings.oops_something, null, 400);

      }
    }

    else return responseHelper.post(res, appstrings.no_record, null, 204);


  }
  catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }

})


app.get("/test", async (req, res) => {

  sendEmail("f2a35624-bdd6-445c-b76f-ee90b656d05e", "ansarisaira@yopmail.com")

})
app.delete('/delete', checkAuth, async (req, res) => {
  const params = req.query;

  let responseNull = common.checkParameterMissing([params.orderId])
  if (responseNull) return responseHelper.error(res, appstrings.required_field, 400);

  try {
    const orderData = await ORDERS.findOne({
      where: {
        id: params.orderId,
        userId: req.id

      }
    })

    if (orderData) {


      if (orderData.progressStatus >= 1)
        return responseHelper.post(res, appstrings.order_not_delete, null, 400);


      const numAffectedRows = await ORDERS.destroy({
        where: {
          id: params.orderId

        }
      })

      if (numAffectedRows > 0)
        return responseHelper.post(res, appstrings.order_delete_success, null);

    }
    else
      return responseHelper.error(res, appstrings.no_record, 404);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});



function diff_mins(dt2, dt1) {

  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff * 60));

}


async function UpdateLoyalityPoints(userId, usedPoints, companyId, orderId) {

  var award = 0
  var userData = await USERS.findOne({ where: { id: userId } })
  var lSettings = await DOCUMENT.findOne({ where: { companyId: companyId } })

  if (lSettings && lSettings.dataValues && lSettings.dataValues.loyalityPoints) {


    if (userData.dataValues.userType == 4)
      award = lSettings.dataValues.lpProMember;

    else award = lSettings.dataValues.loyalityPoints;

  }


  if (userData) {

    exPoints = parseInt(userData.dataValues.lPoints)
    var newPoints = parseInt(award) + (exPoints - parseInt(usedPoints))
    if (newPoints < 0) newPoints = 0
    //console.log("AWARD....>>>>>>>>>>>>>>>>>>>",newPoints)

    USERS.update({ lPoints: newPoints }, { where: { id: userId } })
    LPHISTORY.create({ userId: userId, payType: 0, orderId: orderId, points: parseInt(usedPoints) })//Debited
    LPHISTORY.create({ userId: userId, payType: 1, orderId: orderId, points: award })//Credited

  }

}



async function refundAmount(orderId, userId) {

  var amountData = await PAYMENT.findOne({
    where: {
      orderId: orderId,
      userId: userId,
      paymentType: 1,
      transactionStatus: 1

    }
  })

  if (amountData) {

    var cValue = await DOCUMENT.findOne({
      where: {
        companyId: config.PARENT_COMPANY,

      }
    })


    var charges = 0
    if (cValue && cValue.dataValues.cancellationCharges)
      charges = cValue.dataValues.cancellationCharges;


    var paymentId = (amountData.dataValues.transactionId) ? amountData.dataValues.transactionId : ""
    var amountT = (amountData.dataValues.amount) ? amountData.dataValues.amount : 0


    var amount = (amountT - ((charges * amountT) / 100)).toFixed(2)
    // production = true, test = false


    //    var paymentData = {
    //     productinfo: "PZK",
    //     txnid: "ZCzs",
    //     amount: "50",
    //     email: "pika@yopmail.com",
    //     phone: "9988859974",
    //     lastname: "",
    //     firstname: "Pikachu",
    //     surl: "http://localhost:3000/payu/success", //"http://localhost:3000/payu/success"
    //     furl: "http://localhost:3000/payu/success", //"http://localhost:3000/payu/fail"
    // };

    //    payumoney.makePayment(paymentData, function(error, response) {
    //     if (error) {
    //       console.log(">ERROR>",error);
    //       // Some error
    //     } else {
    //       // Payment redirection link
    //       console.log(">RESPONSE>",response);
    //     }
    //   });

    //paymentId=250583610
    //amount=5

    //console.log(">>>>>>>>>>>>>",paymentId,amount)

    // payumoney.paymentResponse("9084044997", function(error, rep) {
    //   if (error) {
    //     console.log("...........Error",error);
    //   } else {
    //     console.log("...........RESp",rep);
    //   }
    // })



    payumoney.refundPayment(paymentId, amount, async function (error, response) {
      if (error) {
        // Some error
        console.log(">>>>>>>>>>>>Error", error)
      } else {
        if (response.status == 1) {
          await ORDERS.update({
            refundType: 1,
          },
            {
              where: {
                id: orderId
              }
            });

        }

        console.log(">>>>>>>RESPONSE", response);
      }
    });


  }
}

async function sendEmail(orderId, email) {

  var orderData = await ORDERS.findOne({
    where: { id: orderId },
    include: [
      { model: ADDRESS, attributes: ['id', 'addressName', 'addressType', 'houseNo', 'latitude', 'longitude', 'town', 'landmark', 'city'] },
      { model: COMPANY, attributes: ['companyName', 'logo1', 'rating', 'totalRatings', 'address1', 'latitude', 'longitude'], required: true },
      {
        model: SUBORDERS, attributes: ['id', 'serviceId', 'quantity'],
        include: [{
          model: SERVICES,
          attributes: ['id', 'name', 'productType', 'description', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration'],
          required: false
        }]


      }


    ]

  });



  orderData = JSON.parse(JSON.stringify(orderData))



  var currency = await commonMethods.getCurrency(orderData.companyId)
  if (currency && currency.dataValues && currency.dataValues.currency)
    CURRENCY = currency.dataValues.currency


  //console.log(orderData.suborders[0].service)

  var index = fs.readFileSync('html/neworder.html', 'utf8');
  var renderedHtml = ejs.render(index,
    orderData);
  var mailOptions = {
    from: config.REMINDER_MAIL,
    to: email,
    subject: config.NEW_ORDER,
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
