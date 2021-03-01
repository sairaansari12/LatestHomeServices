
const express = require('express');

const app = express();
const bcrypt = require('bcryptjs');
const v = require('node-input-validator');
const hashPassword = require('../../helpers/hashPassword');

const jwt = require('jsonwebtoken');
const util = require('util');
const mysql = require('mysql2/promise');
require('dotenv').config({
  path: `../env-files/${process.env.NODE_ENV || 'development'}.env`,
});


USER = db.models.users
// Generate Hash
const createHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};



app.post('/logout', checkAuth, async (req, res, next) => {
  const params = req.body;
  try {

    const updatedResponse = await USER.update({
      sessionToken: "",
      deviceToken: "",
    },
      {
        where: {
          id: req.id,
          companyId: req.myCompanyId
        }
      });



    if (updatedResponse) {
      return responseHelper.post(res, 'Logout Successfully');
    }

    else
      return responseHelper.post(res, 'Logout Successfully');


  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }




})



app.post('/signup', async (req, res) => {
  try {
    const data = req.body;


    let responseNull = commonMethods.checkParameterMissing([data.phoneNumber, data.countryCode, data.companyId, data.firstName, data.email, data.password])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);


    const user = await USER.findOne({
      attributes: ['phoneNumber'],
      where: {
        phoneNumber: data.phoneNumber,
        companyId: data.companyId

      }
    });



    if (!user) {
      const pswd = await hashPassword.generatePass(data.password);
      data.password = pswd;



      const users = await USER.create({
        firstName: data.firstName,
        email: data.email,
        address: data.address,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        password: pswd,
        deviceToken: data.deviceToken,
        platform: data.platform,
        companyId: data.companyId
      });


      if (users) {
        const userId = users.dataValues.id;
        data.userId = userId;
        const credentials = {
          phoneNumber: users.dataValues.phoneNumber,
          companyId: users.dataValues.companyId,
          countryCode: users.dataValues.countryCode,
          userType: 1,
          id: userId
        };



        const authToken = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: config.authTokenExpiration });
        const refreshToken = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: config.refreshTokenExpiration });
        const userDetail = {};
        userDetail.email = users.dataValues.email;
        userDetail.firstName = users.dataValues.firstName;
        userDetail.lastName = users.dataValues.lastName;
        userDetail.image = '';
        // userDetail.deviceToken = users.dataValues.deviceToken;
        userDetail.sessionTken = authToken;
        userDetail.refreshToken = refreshToken;
        userDetail.id = userId;


        const updateDevicetoken = await USER.update({
          sessionToken: authToken,
          platform: data.deviceToken,
          deviceToken: data.deviceToken,
        },
          {
            where: {
              id: users.dataValues.id
            }
          });
        return responseHelper.post(res, appstring.success, userDetail);
      }

    } else {
      responseHelper.error(res, appstrings.already_exists, 409);
    }

  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})



app.post('/login', async (req, res, next) => {
  const params = req.body;


  let responseNull = commonMethods.checkParameterMissing([params.phoneNumber, params.countryCode, params.companyId])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);


  var countryCode=params.countryCode.replace("+","")
  try {
    const userData = await USER.findOne({
      where: {
        phoneNumber: params.phoneNumber,
        countryCode: countryCode

      }
    })

    if (userData) {


      let token = jwt.sign(
        {
          phoneNumber: params.phoneNumber,
          myCompanyId: userData.dataValues.companyId,
          countryCode: countryCode,
          userType: 1,
          parentCompany: userData.dataValues.companyId,
          id: userData.dataValues.id

        },
        config.jwtToken,
        { algorithm: 'HS256', expiresIn: '2880m' }
      );



      const updatedResponse = await USER.update({
        sessionToken: token,
        platform: params.platform,
        deviceToken: params.deviceToken,
      },
        {
          where: {
            id: userData.dataValues.id
          }
        });



      if (updatedResponse) {
        if (params.referralCode && params.referralCode != "")
          setReferralPoints(params.referralCode, userData.dataValues.id, params.companyId, userData.dataValues.lPoints)

        userData.dataValues.sessionToken = token
        userData.dataValues.platform = params.platform
        userData.dataValues.deviceToken = params.deviceToken
        userData.dataValues.isFirst = false
        var btype = await commonMethods.getBusinessType(params.companyId)
        if (btype && btype.dataValues && btype.dataValues.type) userData.dataValues.btype = btype.dataValues.type
        else userData.dataValues.btype = 0

        console.log("=======userData", userData.dataValues)
        return responseHelper.post(res, 'Login Successfully', userData);
      }
    }

    else {


      const users = await USER.create({
        firstName: params.firstName,
        email: params.email,
        address: params.address,
        phoneNumber: params.phoneNumber,
        countryCode: countryCode,
        deviceToken: params.deviceToken,
        platform: params.platform,
        companyId: params.companyId
      });


      if (users) {
        const userId = users.dataValues.id;
        params.userId = userId;


        const credentials = {
          phoneNumber: users.dataValues.phoneNumber,
          myCompanyId: users.dataValues.companyId,
          parentCompany: users.dataValues.companyId,
          countryCode: users.dataValues.countryCode,
          userType: 1,
          id: userId
        };



        const authToken = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: config.authTokenExpiration });
        const refreshToken = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: config.refreshTokenExpiration });

        if (params.referralCode && params.referralCode != "") setReferralPoints(params.referralCode, userId, params.companyId, users.dataValues.lPoints)



        var referralCode = "USERDELC" + userId.substring(1, 7).toUpperCase()


        const updateDevicetoken = await USER.update({
          sessionToken: authToken,
          platform: params.deviceToken,
          deviceToken: params.deviceToken,
          refreshToken: refreshToken,
          referralCode: referralCode

        },
          {
            where: {
              id: users.dataValues.id
            }
          });

        const userData = await USER.findOne({
          where: {
            id: users.dataValues.id,

          }
        })

        var btype = await commonMethods.getBusinessType(params.companyId)
        if (btype && btype.dataValues && btype.dataValues.type) userData.dataValues.btype = btype.dataValues.type
        else userData.dataValues.btype = 0
        if (userData) {
          userData.dataValues.isFirst = true

          return responseHelper.post(res, 'User Detail', userData);
        }
        else return responseHelper.post(res, 'Something Error', null, 400);

      }
    }


  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

})

app.post('/loginTrial', async (req, res, next) => {
  const params = req.body;


  let responseNull = commonMethods.checkParameterMissing([params.phoneNumber, params.countryCode])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);
  var countryCode=params.countryCode.replace("+","")

  try {
    const userData = await USER.findOne({
      where: {
        phoneNumber: params.phoneNumber,
        countryCode: countryCode,

      }
    })

    if (userData) {


      let token = jwt.sign(
        {
          phoneNumber: params.phoneNumber,
          myCompanyId: userData.dataValues.companyId,
          countryCode: countryCode,
          userType: 1,
          parentCompany: userData.dataValues.companyId,
          id: userData.dataValues.id

        },
        config.jwtToken,
        { algorithm: 'HS256', expiresIn: '2880m' }
      );



      const updatedResponse = await USER.update({
        sessionToken: token,
        platform: params.platform,
        deviceToken: params.deviceToken,
      },
        {
          where: {
            id: userData.dataValues.id
          }
        });



      if (updatedResponse) {
        if (params.referralCode && params.referralCode != "")
          setReferralPoints(params.referralCode, userData.dataValues.id,  userData.dataValues.companyId, userData.dataValues.lPoints)

        userData.dataValues.sessionToken = token
        userData.dataValues.platform = params.platform
        userData.dataValues.deviceToken = params.deviceToken
        userData.dataValues.isFirst = false
        var btype = await commonMethods.getBusinessType(userData.dataValues.id)
        if (btype && btype.dataValues && btype.dataValues.type) userData.dataValues.btype = btype.dataValues.type
        else userData.dataValues.btype = 0

        return responseHelper.post(res, 'Login Successfully', userData);
      }
    }

    else{
      return responseHelper.post(res, appstrings.unauthorized_access, null,400);

    }


  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

})



app.post('/useReferral', checkAuth, async (req, res, next) => {
  const params = req.body;

  var userId = req.id
  let responseNull = commonMethods.checkParameterMissing([params.referralCode, params.companyId])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);




  try {
    const userData = await USER.findOne({
      where: {
        referralCode: params.referralCode,

      }
    });

    const myData = await USER.findOne({
      where: {
        id: userId,

      }
    });


    if (userData) {


      const referData = await DOCUMENT.findOne({
        attributes: ['id', 'lpReferral1', 'lpReferral2'],
        where: {
          companyId: params.companyId,

        }
      });
      var points = 50
      var points1 = 25

      if (referData && referData.dataValues && referData.dataValues.lpReferral1)
        points = referData.dataValues.lpReferral1

      if (referData && referData.dataValues && referData.dataValues.lpReferral2)
        points1 = referData.dataValues.lpReferral2


      if (userData && userData.dataValues != "") {

        var newPoints = parseInt(userData.dataValues.lPoints) + parseInt(points)
        var newPoints1 = parseInt(myData.dataValues.lPoints) + parseInt(points1)

        USER.update({ lPoints: newPoints1 }, { where: { id: userId } })
        USER.update({ lPoints: newPoints }, { where: { id: userData.dataValues.id } })


        var notifPushUserData = {
          title: "Congratulations " + points + " points added to your account",
          description: "Congratulations " + points + " points added to your account. Your friend " + myData.dataValues.firstName + " has used your referral code",
          token: userData.dataValues.deviceToken,
          platform: userData.dataValues.platform,
          userId: userData.dataValues.id,
          role: 3,
          notificationType: "REFERRAL_REWARD",
          status: 1,
        }



        var notifPushUserData1 = {
          title: "Congratulations " + points1 + " points added to your account",
          description: "Congratulations " + points1 + " points added to your account by using referral code",
          token: myData.dataValues.deviceToken,
          platform: myData.dataValues.platform,
          userId: myData.dataValues.id,
          role: 3,
          notificationType: "REFERRAL_REWARD",
          status: 1,
        }






        commonNotification.insertNotification(notifPushUserData)
        commonNotification.sendNotification(notifPushUserData)

        commonNotification.insertNotification(notifPushUserData1)
        commonNotification.sendNotification(notifPushUserData1)

        return responseHelper.post(res, appstrings.success, null, 200);


      }


    }


    else

      return responseHelper.post(res, appstrings.invalid_referral, null, 400);







  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

})

async function setReferralPoints(referralCode, userId, parentCompany, myLPoints) {
  try {
    const userData = await USER.findOne({
      where: {
        referralCode: referralCode,

      }
    });

    const myData = await USER.findOne({
      where: {
        id: userId,

      }
    });


    if (userData) {


      const referData = await DOCUMENT.findOne({
        attributes: ['id', 'lpReferral1', 'lpReferral2'],
        where: {
          companyId: parentCompany,

        }
      });
      var points = 50
      var points1 = 25

      if (referData && referData.dataValues && referData.dataValues.lpReferral1)
        points = referData.dataValues.lpReferral1

      if (referData && referData.dataValues && referData.dataValues.lpReferral2)
        points1 = referData.dataValues.lpReferral2


      if (userData && userData.dataValues != "") {

        var newPoints = parseInt(userData.dataValues.lPoints) + parseInt(points)
        var newPoints1 = parseInt(myLPoints) + parseInt(points1)

        USER.update({ lPoints: newPoints1 }, { where: { id: userId } })


        USER.update({ lPoints: newPoints }, { where: { id: userData.dataValues.id } })





        var notifPushUserData = {
          title: "Congratulations " + points + " points added to your account",
          description: "Congratulations " + points + " points added to your account. Your friend " + myData.dataValues.firstName + " has used your referral code",
          token: userData.dataValues.deviceToken,
          platform: userData.dataValues.platform,
          userId: userData.dataValues.id,
          role: 3,
          notificationType: "REFERRAL_REWARD",
          status: 1,
        }
        LPHISTORY.create({ userId: userData.dataValues.id, payType: 1, orderId:"", points:points })//Debited




        var notifPushUserData1 = {
          title: "Congratulations " + points1 + " points added to your account",
          description: "Congratulations " + points1 + " points added to your account by using referral code",
          token: myData.dataValues.deviceToken,
          platform: myData.dataValues.platform,
          userId: myData.dataValues.id,
          role: 3,
          notificationType: "REFERRAL_REWARD",
          status: 1,
        }

        LPHISTORY.create({ userId: myData.dataValues.id, payType: 1, orderId:"", points:points1 })//Debited





        commonNotification.insertNotification(notifPushUserData)
        commonNotification.sendNotification(notifPushUserData)

        commonNotification.insertNotification(notifPushUserData1)
        commonNotification.sendNotification(notifPushUserData1)



      }
    }

  }
  catch (e) {
    console.log(e)
  }

}


module.exports = app;



//Edit User Profile
