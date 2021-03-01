const express          = require('express');
const router           = express.Router();

const authController   = require('../controllers/main/mauth.controller');

const profileCtrl   = require('../controllers/main/mprofile.controller');
const compCtrl   = require('../controllers/main/mcompany.controller');
const trialCtrl   = require('../controllers/main/mtrials.controller');


router.use('/',authController);
router.use('/profile',profileCtrl);
router.use('/company',compCtrl);
router.use('/trial',trialCtrl);


router.use((req, res, next) => {

   return responseHelper.error(res, 'Please again check the url,this path is not specified', 404);
});

module.exports = router;