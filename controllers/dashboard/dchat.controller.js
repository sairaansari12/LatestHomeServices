const express = require('express');
const app     = express();
const Op = require('sequelize').Op;
const jwt = require('jsonwebtoken');


app.get('/',adminAuth, async (req, res, next) => {
    const credentials = {
      phoneNumber: req.session.userData.phoneNumber,
      companyId:   req.companyId,
      countryCode: req.session.userData.countryCode,
      userType: req.session.userData.role,
      id : req.id,
    };
    const authToken = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: config.authTokenExpiration });
   return res.render('admin/chat/chat.ejs',{ token: authToken, id: req.id});
});



 module.exports = app;