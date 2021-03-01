const express          = require('express');
const router           = express.Router();

const authController   = require('../controllers/super/superauth.controller');
const empCtrl          = require('../controllers/super/superemployees.controller');
const companyCtrl      = require('../controllers/super/supercompany.controller');
const osettingCtrl     = require('../controllers/super/superinstruction.controller');
const profileCtrl      = require('../controllers/super/superprofile.controller');
const userCtrl         = require('../controllers/super/superusers.controller');
const subscriptionController  = require('../controllers/super/supersubscription.controller');
const coupanCtrl              = require('../controllers/super/supercoupan.controller');
const offerCtrl              = require('../controllers/super/superoffer.controller');
const dealCtrl              = require('../controllers/super/superdeal.controller');
const bannerCtrl              = require('../controllers/super/superbanner.controller');
const tagCtrl              = require('../controllers/super/supertags.controller');
const notifCtrl              = require('../controllers/super/supernotification.controller');
const faqCtrl              = require('../controllers/super/superfaq.controller');
const contactCtrl              = require('../controllers/super/supercontact.controller');
const productCtrl              = require('../controllers/super/superproduct.controller');
const paymentCtrl              = require('../controllers/super/superpayment.controller');
const settingsCtrl              = require('../controllers/super/supersettings.controller');
const ratingsCtrl              = require('../controllers/super/superratings.controller');
const categoryController              = require('../controllers/super/supercategory.controller');
const filterCtrl              = require('../controllers/super/superfilters.controller');





const settingCtrl      = require('../controllers/super/superdocument.controller');
router.use('/employees/',empCtrl);
router.use('/',authController);

router.use('/company',companyCtrl);
router.use('/ordersetting/',osettingCtrl)
router.use('/profile/',profileCtrl);
router.use('/users/',userCtrl);
router.use('/subscription/',subscriptionController);
router.use('/coupans/',coupanCtrl);
router.use('/offers/',offerCtrl);
router.use('/deals/',dealCtrl);
router.use('/banner/',bannerCtrl);
router.use('/tags/',tagCtrl);
router.use('/notification/',notifCtrl);
router.use('/faq/',faqCtrl);
router.use('/contactus/',contactCtrl);
router.use('/products/',productCtrl);
router.use('/payment/',paymentCtrl);
router.use('/settings/',settingsCtrl);
router.use('/ratings/',ratingsCtrl);
router.use('/category/',categoryController);
router.use('/filters/',filterCtrl);

router.use((req, res, next) => {

   return responseHelper.error(res, 'Please again check the url,this path is not specified', 404);
});

module.exports = router;