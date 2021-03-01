const express                     = require('express');
const router                      = express.Router();

const authController              = require('../controllers/delivery/delauthController');
const profileCtrl              = require('../controllers/delivery/delprofile.controller');
const orderCtrl              = require('../controllers/delivery/delorders.controller');
const notificationCtrl              = require('../controllers/delivery/delnotification.controller');



router.use('/auth',authController);
router.use('/profile/',profileCtrl);
router.use('/orders/',orderCtrl);
router.use('/notification/',notificationCtrl);



router.use((req, res, next) => {

   return responseHelper.error(res, 'Please again check the url,this path is not specified', 404);
});

module.exports = router;