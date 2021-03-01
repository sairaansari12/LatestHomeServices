const express                     = require('express');
const router                      = express.Router();

const authController              = require('../controllers/vAdmin/vAauth.controller');
const categoryController              = require('../controllers/vAdmin/vAcategory.controller');
const ordersCtrl              = require('../controllers/vAdmin/vAorders.controller');
const coupanCtrl              = require('../controllers/vAdmin/vAcoupan.controller');
const empCtrl              = require('../controllers/vAdmin/vAemployees.controller');
const scheduleCtrl              = require('../controllers/vAdmin/vAschedule.controller');
const ratingCtrl              = require('../controllers/vAdmin/vAratings.controller');
const profileCtrl              = require('../controllers/vAdmin/vAprofile.controller');
const faqCtrl              = require('../controllers/vAdmin/vAfaq.controller');
const bannerCtrl              = require('../controllers/vAdmin/vAbanner.controller');
const paymentCtrl              = require('../controllers/vAdmin/vApayment.controller');
const notificationCtrl              = require('../controllers/vAdmin/vAnotification.controller');
const productCtrl = require('../controllers/vAdmin/vAproduct.controller');
const galleryCtrl = require('../controllers/vAdmin/vAgallery.controller');
const chatCtrl = require('../controllers/vAdmin/vAchat.controller');

//New Routes
const dealCtrl              = require('../controllers/vAdmin/vAdeal.controller');
const offerCtrl              = require('../controllers/vAdmin/vAoffer.controller');
const settingCtrl = require('../controllers/vAdmin/vAsettings.controller');
const osettingCtrl = require('../controllers/vAdmin/vAinstruction.controller');
const addOnController = require('../controllers/vAdmin/daddOns.controller');
const taskController  = require('../controllers/vAdmin/vAtask.controller');
const tagsCtrl  = require('../controllers/vAdmin/vAtags.controller');
const contactUsController  = require('../controllers/vAdmin/vAcontactus.controller');



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
router.use('/contactus/',contactUsController);
router.use('/gallery/',galleryCtrl);
router.use('/chat/',chatCtrl);


router.use((req, res, next) => {

   return res.render('admin/partials/404.ejs');

  // return responseHelper.error(res, 'Please again check the url,this path is not specified', 404);
});

module.exports = router;


