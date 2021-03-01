
const express = require('express');
const { restAuth } = require('../../../middleware/auth');
const app = express();
const Op = require('sequelize').Op;





app.post('/list', restAuth, async (req, res, next) => {

  try {
    var params = req.body
    var progressStatus = ['0', '1', '2', '3', '4', '5']
    //var pStatus= await ORDERSTATUS.findAll({companyId:req.parentCompany});
    var fromDate = ""
    var toDate = ""


    var page = 1
    var limit = 50
    if (params.page) page = params.page
    if (params.limit) limit = parseInt(params.limit)
    var offset = (page - 1) * limit


    if (params.progressStatus && params.progressStatus != "") progressStatus = [params.progressStatus]

    where = {
      companyId: req.id,
      progressStatus: { [Op.or]: progressStatus }
    }


    where1 = { companyId: req.id, progressStatus: { [Op.or]: progressStatus } }
    if (params.fromDate) fromDate = Math.round(new Date(params.fromDate).getTime())
    if (params.toDate) toDate = Math.round(new Date(params.toDate).getTime())


    if (fromDate != "" && toDate != "") {
      where = {
        companyId: req.id,
        progressStatus: { [Op.or]: progressStatus },
        createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate },
      }

      where1 = {
        companyId: req.id,
        progressStatus: { [Op.or]: progressStatus },
        createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate },
      }

    }

    const findData = await ORDERS.findAndCountAll({
      attributes: ['orderNo', 'id', 'serviceDateTime', 'orderPrice', 'totalOrderPrice', 'createdAt'],
      order: [
        ['createdAt', 'DESC'],
      ],
      where: where,

      include: [
        { model: USER, attributes: ['id', 'firstName', 'lastName'] },
        { model: PAYMENT, attributes: ['transactionStatus'] },
        { model: ORDERSTATUS, attributes: ['statusName'] },
        {
          model: SUBORDERS, attributes: ['id', 'serviceId', 'quantity'],
          include: [{
            model: SERVICES,
            attributes: ['id', 'name', 'price', 'thumbnail', 'type', 'price'],
            required: false
          }]
        }

      ],
      distinct: true,
      offset: offset, limit: limit,

    });




    return responseHelper.post(res, appstrings.success, findData);

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }


});




app.get('/detail', restAuth, async (req, res, next) => {

  var id = req.query.orderId
  try {

    let responseNull = common.checkParameterMissing([id])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);





    const findData = await ORDERS.findOne({
      where: { id: id },
      include: [
        { model: ADDRESS, attributes: ['id', 'addressName', 'addressType', 'houseNo', 'latitude', 'longitude', 'town', 'landmark', 'city'] },
        { model: USERS, attributes: ['firstName', 'lastName', 'countryCode', 'phoneNumber', 'image'] },
        {
          model: ASSIGNMENT, attributes: ['id'],
          include: [{
            model: EMPLOYEE,
            attributes: ['id', 'firstName', 'lastName', 'countryCode', 'phoneNumber', 'image'],
            required: false
          }]

        },
        { model: ORDERSTATUS, attributes: ['statusName'] },
        {
          model: SUBORDERS, attributes: ['id', 'serviceId', 'quantity'],
          include: [{
            model: SERVICES,
            attributes: ['id', 'name', 'description', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration'],
            required: false
          }]
        },

      ]


    });



    if (findData) return responseHelper.post(res, appstrings.detail, findData, 200);

    else return responseHelper.post(res, appstrings.no_record, null, 204);





    //return res.render('admin/orders/viewOrder.ejs',{data:findData,empData:empData});



  } catch (e) {
    return responseHelper.error(res, e.message, 400);

  }



});


app.get('/allStatus', restAuth, async (req, res, next) => {

  try {


    var findData = await commonMethods.getOrdersAllStatus(req.parentCompany);



    if (findData) return responseHelper.post(res, appstrings.detail, findData, 200);

    else return responseHelper.post(res, appstrings.no_record, null, 204);





  } catch (e) {
    return responseHelper.error(res, e.message, 400);

  }



});



app.post('/status', restAuth, async (req, res, next) => {

  var params = req.body
  try {
    let responseNull = commonMethods.checkParameterMissing([params.id, params.status])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);



    var userData = await ORDERS.findOne({
      where: {
        id: params.id
      },
      include: [{
        model: ASSIGNMENT, attributes: ['id'],
        include: [{
          model: EMPLOYEE,
          attributes: ['id', 'firstName', 'lastName', 'countryCode', 'phoneNumber', 'image'],
          required: false
        }]
      }]
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
        var status = await commonMethods.getOrderStatus(params.status)

        userData = JSON.parse(JSON.stringify(userData))
        var findData = await USER.findOne({ where: { id: userData.userId } });
        var notifPushUserData = {
          title: "Your order No.- " + userData.orderNo + ' is ' + status + ' on ' + commonMethods.formatAMPM(new Date),
          description: "Your order No.- " + userData.orderNo + ' is ' + status + ' on ' + commonMethods.formatAMPM(new Date),
          token: findData.dataValues.deviceToken,
          platform: findData.dataValues.platform,
          userId: userData.userId, role: 3,
          orderId: userData.id,
          notificationType: "ORDER_STATUS", status: status,
        }




        if (userData.assignedEmployees && userData.assignedEmployees.length > 0 && (params.status == 2 || params.status == 4)) {
          for (var p = 0; p < userData.assignedEmployees.length; p++) {

            var findData = await EMPLOYEE.findOne({ where: { id: userData.assignedEmployees[p].employee.id } });

            console.log("======restaurant status", findData.dataValues, userData.assignedEmployees[p].employee.id)
            var notifPushUserDataEmp = {
              title: "Your order No.- " + userData.orderNo + ' is ' + status + ' on ' + commonMethods.formatAMPM(new Date),
              description: "Your order No.- " + userData.orderNo + ' is ' + status + ' on ' + commonMethods.formatAMPM(new Date),
              token: findData.dataValues.deviceToken,
              platform: findData.dataValues.platform,
              userId: findData.id, role: 4,
              orderId: userData.id,
              notificationType: "ORDER_STATUS", status: status,
            }
            commonNotification.insertNotification(notifPushUserDataEmp)
            commonNotification.sendEmpNotification(notifPushUserDataEmp)

          }
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


app.post('/updateAssignment', restAuth, async (req, res, next) => {

  var params = req.body
  var employees = []
  try {
    let responseNull = commonMethods.checkParameterMissing([params.orderId])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

    if (params.employees) employees = params.employees.toString().split(",")

    var ordData = await ORDERS.findOne({
      where: {
        id: params.orderId
      }
    });


    if (ordData && (ordData.dataValues.progressStatus == 0)) return responseHelper.post(res, appstrings.order_not_confirmed, null, 400);


    await ASSIGNMENT.destroy({
      where: {
        orderId: params.orderId,
        jobStatus: 1
      }
    });



    for (var k = 0; k < employees.length; k++) {
      await ASSIGNMENT.create({
        empId: employees[k],
        orderId: params.orderId

      });


      var findData = await EMPLOYEE.findOne({ where: { id: employees[k] } });
      console.log("======restaurant status", findData.dataValues, employees[k])

      var notifPushUserData = {
        title: appstrings.new_order_assigned + "  " + commonMethods.formatAMPM(new Date),
        description: appstrings.new_order_assigned + '  ' + commonMethods.formatAMPM(new Date) + " Order No- " + ordData.orderNo,
        token: findData.dataValues.deviceToken,
        orderId: ordData.id,
        platform: findData.dataValues.platform,
        userId: findData.id, role: 4,
        notificationType: "ORDER_STATUS", status: 0,
      }

      commonNotification.insertNotification(notifPushUserData)
      commonNotification.sendEmpNotification(notifPushUserData)





    }

    return responseHelper.post(res, appstrings.success, null);
  }

  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }



});


app.post('/update', restAuth, async (req, res) => {
  try {
    const data = req.body;


    let responseNull = commonMethods.checkParameterMissing([data.userId, data.phoneNumber, data.countryCode, data.firstName, data.email])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);


    const user = await USER.findOne({
      attributes: ['phoneNumber'],
      where: {
        id: data.userId,
        companyId: req.companyId

      }
    });



    if (user) {

      const users = await USER.update({
        firstName: data.firstName,
        email: data.email,
        address: data.address,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
      },

        {
          where:
          {
            id: data.userId,
            companyId: req.companyId
          }
        }

      );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null, 200);

      }
      else responseHelper.error(res, appstrings.oops_something, 400);


    }
    else responseHelper.post(res, appstrings.no_record, 204);



  } catch (e) {
    return responseHelper.error(res, 'Error While Creating User', e.message);
  }
});


module.exports = app;

