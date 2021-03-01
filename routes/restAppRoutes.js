const express                     = require('express');
const router                      = express.Router();

const authController              = require('../controllers/api/restaurant/rauth.controller');
const orderController              = require('../controllers/api/restaurant/rorders.controller');



router.use('/auth',authController);
router.use('/orders',orderController);

// router.use('/profile/',profileCtrl);
// router.use('/orders/',orderCtrl);
// router.use('/notification/',notificationCtrl);



router.use((req, res, next) => {

   return responseHelper.error(res, 'Please again check the url,this path is not specified', 404);
});

module.exports = router;