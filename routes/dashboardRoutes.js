const express                     = require('express');
const router                      = express.Router();

const authController              = require('../controllers/dashboard/dauth.controller');
const categoryController              = require('../controllers/dashboard/dcategory.controller');
const ordersCtrl              = require('../controllers/dashboard/dorders.controller');
const coupanCtrl              = require('../controllers/dashboard/dcoupan.controller');
const empCtrl              = require('../controllers/dashboard/demployees.controller');
const scheduleCtrl              = require('../controllers/dashboard/dschedule.controller');
const ratingCtrl              = require('../controllers/dashboard/dratings.controller');
const profileCtrl              = require('../controllers/dashboard/dprofile.controller');
const faqCtrl              = require('../controllers/dashboard/dfaq.controller');
const bannerCtrl              = require('../controllers/dashboard/dbanner.controller');
const paymentCtrl              = require('../controllers/dashboard/dpayment.controller');
const notificationCtrl              = require('../controllers/dashboard/dnotification.controller');
const productCtrl = require('../controllers/dashboard/dproduct.controller');
const galleryCtrl = require('../controllers/dashboard/dgallery.controller');
const chatCtrl = require('../controllers/dashboard/dchat.controller');
const userCtrl = require('../controllers/dashboard/dusers.controller');

//New Routes
const dealCtrl              = require('../controllers/dashboard/ddeal.controller');
const offerCtrl              = require('../controllers/dashboard/doffer.controller');
const settingCtrl = require('../controllers/dashboard/dsettings.controller');
const osettingCtrl = require('../controllers/dashboard/dinstruction.controller');
const addOnController = require('../controllers/dashboard/daddOns.controller');
const taskController  = require('../controllers/dashboard/dtask.controller');
const tagsCtrl  = require('../controllers/dashboard/dtags.controller');
const contactUsController  = require('../controllers/dashboard/dcontactus.controller');
const subscriptionController  = require('../controllers/dashboard/dsubscription.controller');
const contactCtrl              = require('../controllers/dashboard/dcontact.controller');



router.use('/',authController);
router.use('/category/',categoryController);
//router.use('/subservice/',subserviceCtrl);
router.use('/orders/',ordersCtrl);
router.use('/coupans/',coupanCtrl);
router.use('/employees/',empCtrl);
router.use('/schedule/',scheduleCtrl);
router.use('/ratings/',ratingCtrl);
router.use('/profile/',profileCtrl);
router.use('/faq/',faqCtrl);
router.use('/banner/',bannerCtrl);
router.use('/payment/',paymentCtrl);
router.use('/notification/',notificationCtrl);
router.use('/products/',productCtrl);
router.use('/deals/',dealCtrl);
router.use('/addons/',addOnController);
router.use('/offers/',offerCtrl);
router.use('/offers/',offerCtrl);
router.use('/settings/',settingCtrl);
router.use('/tags/',tagsCtrl);
router.use('/ordersetting/',osettingCtrl)
router.use('/task/',taskController);
router.use('/contactus/',contactCtrl);
router.use('/gallery/',galleryCtrl);
router.use('/chat/',chatCtrl);
router.use('/users/',userCtrl);
router.use('/subscription/',subscriptionController);


router.use((req, res, next) => {

   return res.render('admin/partials/404.ejs');

  // return responseHelper.error(res, 'Please again check the url,this path is not specified', 404);
});

module.exports = router;


