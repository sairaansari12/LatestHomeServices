
const express = require('express');
const app = express();
const Op = require('sequelize').Op;
var _ = require('underscore')

const CART = db.models.cart
const SERVICES = db.models.services
//Relations
CART.belongsTo(SERVICES, { foreignKey: 'serviceId' })
const COUPAN = db.models.coupan;


app.post('/add', checkAuth, async (req, res, next) => {
  const params = req.body;


  let responseNull = commonMethods.checkParameterMissing([params.companyId, params.serviceId, params.orderPrice, params.quantity, params.orderTotalPrice])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  try {

    const catData = await CART.findOne({
      where: {
        userId: req.id
      }
    })
    var type = "Pickup"

    if (catData && catData.deliveryType != params.deliveryType) {
      if (catData.deliveryType == 1)
        type = "Delivery"
      var message = "There are some items in your cart of " + type + " type. Please change your delivery type to '" + type + "' to proceed further "

      return responseHelper.post(res, message, null, 400);
    }

    const oderData = await CART.findOne({
      where: {
        serviceId: params.serviceId,
        userId: req.id
      }
    })

    if (oderData) {


      var newQuantity = parseInt(oderData.dataValues.quantity) + parseInt(params.quantity)
      var norderPrice = parseInt(oderData.dataValues.orderPrice) + parseInt(params.orderPrice)
      var norderTotalPrice = parseInt(oderData.dataValues.orderTotalPrice) + parseInt(params.orderTotalPrice)

      CART.update({
        quantity: newQuantity,
        orderPrice: norderPrice,
        orderTotalPrice: norderTotalPrice
      }, { where: { id: oderData.dataValues.id } })

      return responseHelper.post(res, appstrings.cart_success, oderData);

    }




    else {

      var orderPrice = params.orderPrice


      // Write APPLY PROMO CODE HERE//




      const orderData = await CART.create({


        serviceId: params.serviceId,
        orderPrice: orderPrice,
        orderTotalPrice: params.orderTotalPrice,
        quantity: params.quantity,
        userId: req.id,
        companyId: params.companyId,
        deliveryType: params.deliveryType,


      })

      if (orderData)

        return responseHelper.post(res, appstrings.cart_success, orderData);

      else return responseHelper.post(res, appstrings.oops_something, null, 400);

    }


  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

})



app.put('/update', checkAuth, async (req, res, next) => {
  const params = req.body;


  let responseNull = commonMethods.checkParameterMissing([params.cartId, params.quantity])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  try {
    const cartData = await CART.findOne({
      where: {
        id: params.cartId,
        userId: req.id

      }
    })

    if (cartData) {

      var orderTotalPrice = (parseInt(params.quantity) * parseFloat(cartData.dataValues.orderPrice)).toFixed(2)

      // Write APPLY PROMO CODE HERE//

      const orderData = await CART.update(

        {
          orderTotalPrice: orderTotalPrice,
          quantity: params.quantity,
        },
        {
          where: { id: params.cartId }

        }
      )

      if (orderData) {

        var countDataq = await CART.findOne({
          attributes: ['id', 'companyId', 'promoCode', 'userId',
            [sequelize.fn('sum', sequelize.col('orderTotalPrice')), 'totalSum'],
            [sequelize.fn('sum', sequelize.col('quantity')), 'totalQunatity'],
          ],

          where: {
            userId: req.id

          }
        });
        countDataq = JSON.parse(JSON.stringify(countDataq))

        var dataToBesent = {}
        dataToBesent.sum = countDataq.totalSum
        dataToBesent.totalQunatity = countDataq.totalQunatity

        dataToBesent.orderTotalPrice = orderTotalPrice
        dataToBesent.quantity = params.quantity
        dataToBesent.orderPrice = cartData.dataValues.orderPrice


        return responseHelper.post(res, appstrings.cart_update_success, dataToBesent);
      }

      else return responseHelper.post(res, appstrings.oops_something, null, 400);

    }


    else return responseHelper.post(res, appstrings.no_record, null, 204);

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

})


app.get('/list', checkAuth, async (req, res) => {

  try {
    var orderData = await CART.findAll({

      order: [
        ['createdAt', 'DESC'],
      ],
      where: {
        userId: req.id

      },

      include: [
        { model: db.models.services, attributes: ['id', 'name', "addOnIds", 'productType', 'description', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration', 'includedServices', 'excludedServices', 'createdAt', 'status', 'originalPrice', 'offer', 'offerName'] }
      ]


    });

    if (orderData) {

      var countDataq = await CART.findOne({
        attributes: ['id', 'companyId', 'promoCode', 'userId',
          [sequelize.fn('sum', sequelize.col('orderTotalPrice')), 'totalSum'],
          [sequelize.fn('sum', sequelize.col('quantity')), 'totalQunatity'],
        ],

        where: {
          userId: req.id

        }
      });

      orderData = JSON.parse(JSON.stringify(orderData))
      countDataq = JSON.parse(JSON.stringify(countDataq))

      var addOns = []
      for (var k = 0; k < orderData.length; k++) {

        if (orderData[k].service && orderData[k].service.addOnIds.length > 0) {
          var dataAddons = await SERVICES.findAll({
            attributes: ['id', 'name', 'productType', 'description', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration', 'includedServices', 'excludedServices', 'createdAt', 'status', 'originalPrice', 'offer', 'offerName'],
            where: {
              id: { [Op.or]: orderData[k].service.addOnIds },
              status: 1,
              deleted: 0,
            }
          });

          if (!addOns.includes(dataAddons) && dataAddons.length > 0) addOns.push(dataAddons)
        }
      }


      var newDaddOns = _.flatten(addOns);
      if (newDaddOns.length > 0) addOns = unique(newDaddOns, ["id"])

      const coupanDetails = await COUPAN.findOne({
        attributes: ['id', 'code', 'discount'],
        where: {
          code: countDataq.promoCode
        }
      });

      var data = {}

      var discount_price = 0
      var payableAmount = parseFloat(countDataq.totalSum)

      if (coupanDetails) {
        let price = parseFloat(countDataq.totalSum);
        let per = parseFloat(coupanDetails.dataValues.discount);
        discount_price = (price / 100) * per;        // Get Percentage Amount
        payableAmount = payableAmount - discount_price;
      } //Payable Amount


      //Check Loyality Points

      var lObject = { maxRange: 0, balance: 0, onePointValue: 0.0, usablePoints: 0.0 }
      var lSettings = await DOCUMENT.findOne({ where: { companyId: countDataq.companyId } })
      var userData = await USERS.findOne({ where: { id: req.id } })

      if (userData && userData.dataValues.lPoints) lObject.balance = parseInt(userData.dataValues.lPoints)

      if (lSettings && lSettings.dataValues) {
        lObject.onePointValue = parseFloat(lSettings.dataValues.onelPValue)
        var range = parseInt(((payableAmount * lSettings.dataValues.lpOrderPercentage) / 100) / lObject.onePointValue)
        lObject.maxRange = range

        if (range >= parseFloat((lObject.balance)))
          lObject.usablePoints = lObject.balance
        else
          lObject.usablePoints = range

      }
        //check old pending charges
        var userCanCharges = await USERWALLET.findAll({
          attributes: [[sequelize.fn('sum', sequelize.col('amount')), 'totalSum']]
        });
        userCanCharges = JSON.parse(JSON.stringify(userCanCharges));
        if(userCanCharges && userCanCharges[0].totalSum && Number(userCanCharges[0].totalSum) < 0){
          pendingCharges = Math.abs(userCanCharges[0].totalSum);
          payableAmount = Number(payableAmount)+pendingCharges;
        } else{
          pendingCharges = 0;
        }


      data['discount'] = discount_price
      data['payableAmount'] = parseFloat(payableAmount)

      data['sum'] = parseFloat(countDataq.totalSum)
      data['totalQunatity'] = countDataq.totalQunatity
      data['data'] = orderData
      data['addOns'] = addOns
      data['lPoints'] = lObject
      data['pendingCharges'] = parseFloat(pendingCharges)




      if (orderData.length > 0)
        return responseHelper.post(res, appstrings.detail, data);
      else
        return responseHelper.post(res, appstrings.detail, data, 204);


    }


  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});




app.get('/detail/:cartId', checkAuth, async (req, res) => {
  var cartId = req.params.cartId

  let responseNull = commonMethods.checkParameterMissing([cartId])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  try {
    const orderData = await CART.findOne({
      where: { id: cartId },
      include: [
        {
          model: db.models.services, attributes: ['id', 'name', 'description', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration', 'includedServices', 'excludedServices', 'createdAt', 'status'],
        }

      ]

    });
    if (orderData) {


      return responseHelper.post(res, appstrings.detail, orderData);


    }
    else return responseHelper.post(res, appstrings.no_record, null, 204);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});



app.delete('/remove', checkAuth, async (req, res, next) => {
  const params = req.query;

  let responseNull = common.checkParameterMissing([params.cartId])
  if (responseNull) return responseHelper.error(res, appstrings.required_field, 400);

  try {
    const orderData = await CART.findOne({
      where: {
        id: params.cartId,
        userId: req.id

      }
    })

    if (orderData) {

      const numAffectedRows = await CART.destroy({
        where: {
          id: params.cartId

        }
      })

      if (numAffectedRows > 0)
        return responseHelper.post(res, appstrings.cart_delete_success, null);

    }
    else
      return responseHelper.post(res, appstrings.no_record, null, 204);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});



app.delete('/clear', checkAuth, async (req, res, next) => {


  try {

    const numAffectedRows = await CART.destroy({
      where: {
        userId: req.id
      }
    })

    if (numAffectedRows > 0)
      return responseHelper.post(res, appstrings.cart_delete_success, null);

    else
      return responseHelper.post(res, appstrings.no_record, null, 204);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});

function unique(arr, keyProps) {
  const kvArray = arr.map(entry => {
    const key = keyProps.map(k => entry[k]).join('|');
    return [key, entry];
  });
  const map = new Map(kvArray);
  return Array.from(map.values());
}
module.exports = app;



//Edit User Profile
