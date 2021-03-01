const config = require('config');
const routes = require('express').Router();
const jwt = require('jsonwebtoken');
 sequelize = require('sequelize');
 commonNotification=require('../controllers/api/common/notifications.controller')


//ALL MODELS

 CATEGORY = db.models.categories
 SERVICES = db.models.services
 CART = db.models.cart
 COUPAN = db.models.coupan
 FAVOURITES = db.models.favourites
 ADDRESS = db.models.address
 BANNERS = db.models.banners
 ORDERS=db.models.orders
 SUBORDERS=db.models.suborders
 SCHEDULE = db.models.schedule
 USERS =db.models.users
 COMPANY = db.models.companies
 DOCUMENT = db.models.document
 FAQ = db.models.faq
 BANNER = db.models.banners
 PAYMENT = db.models.payment
 EMPLOYEE = db.models.employees
 NOTIFICATION = db.models.notifications
 ASSIGNMENT = db.models.assignedEmployees
 CANCELREASON = db.models.cancelReasons
 COMPANYRATING = db.models.companyRatings
 DEAL=db.models.deals
 USERTYPE=db.models.userType
 ROLETYPE=db.models.roleTypes
 BUSINESSTYPE=db.models.businessType
 GALLERY=db.models.gallery
 ORDERSTATUS=db.models.orderStatus
 SERVICERATINGS=db.models.serviceRatings
 DEALS=db.models.deals
 SHIPMENT=db.models.shipment
 INSTRUCTIONS=db.models.instructions
 STAFFRATINGS=db.models.staffRatings
 CONTACTUS=db.models.contactus
 FAQCAT=db.models.faqCategory
 TIFFSERVICES=db.models.tiffinServices
 TIFFINMENU=db.models.tiffinMenu
 TIFFINPACKAGE=db.models.tiffinPackages
 TIFFCART=db.models.tiffinCart
 TIFFORDERS=db.models.tiffinOrders
 TIFFPAYMENT=db.models.tiffinPayment
 TIFFINSTRUCTIONS=db.models.tiffinInstructions
 TIFFASSIGNEDEMP=db.models.tiffinAssignedEmp
 TIFFRATINGS=db.models.tiffinRatings
 RECIPES=db.models.recipes
 RECMEDIA=db.models.recipeMedia
 RECCAT=db.models.recipeCategories
 RELIKE=db.models.recipeLike
 RECOMMENT=db.models.recipeComment
 TAGS=db.models.tags
 STAFFWALLET=db.models.staffWallet
 COMISSION=db.models.comission
 COMISSIONHISTORY=db.models.comissionHistory
 PAYMENTSETUP=db.models.paymentSetup
 PERMISSIONS=db.models.permissions
 APPRATINGS=db.models.appRatings
 SUBSCRIPTION=db.models.subscription
 SUBDURATION=db.models.subscriptionDuration
 USERSUB=db.models.userSubscription
 TRIALS=db.models.trials 
 TRIALSUB=db.models.trialSubscription
 STAFFROLE=db.models.staffRoles
 INFORMATION=db.models.userInformation
 FILTERS=db.models.filters
 LPHISTORY=db.models.lpHistory



 






 
 
 


//const authCtrl       = require('../controllers/authController');
const responseHelper = require('../helpers/responseHelper');
const cronJobCtrl = require('../controllers/cronJobController');
const authCtrl = require('../controllers/api/authController');
const profileCtrl = require('../controllers/api/profile.controller');
const addressCtrl = require('../controllers/api/address.controller');
const serviceCtrl = require('../controllers/api/service.controller');
const ordersCtrl = require('../controllers/api/orders.controller');
const cartCtrl = require('../controllers/api/cart.controller');
const favtCtrl = require('../controllers/api/favourite.controller');
const coupanCtrl = require('../controllers/api/coupan.controller');
const ratingCtrl = require('../controllers/api/rating.controller');
const notifCtrl = require('../controllers/api/notification.controller');
const othrCtrl = require('../controllers/api/others.controller');
const compCtrl = require('../controllers/api/company.controller');
const tiffCtrl = require('../controllers/api/tiffin/tiffin.controller');
const tiffCartCtrl = require('../controllers/api/tiffin/tiffinCart.controller');
const tiffOrderCtrl = require('../controllers/api/tiffin/tiffinOrder.controller');
const tiffRatingCtrl = require('../controllers/api/tiffin/tiffinRating.controller');
const recpCtrl = require('../controllers/api/recipe/recipe.controller');
const recpLikeCtrl = require('../controllers/api/recipe/recipeLike.controller');
const recpCommentCtrl = require('../controllers/api/recipe/recipeComment.controller');
const subCtrrl = require('../controllers/api/subscription.controller');



const scheduleCtrl = require('../controllers/api/schedule.controller');
const companyRoutes   = require('./dashboardRoutes');
const deliveryRoutes   = require('./deliveryRoutes');
const adminRoutes   = require('./superAdminRoutes');
const restAppRoutes   = require('./restAppRoutes.js');
const mainAdminRoutes   = require('./mainAdminRoutes');


const chroneRoutes   = require('../controllers/cronJobController');
const realTimeTrackingController  = require('../controllers/RealTimeTracking');
const appRatings = require('../db/models/appRatings');



////// ================== middleware to set custom message on unauthorized token ================//////
routes.use("/mobile/auth",authCtrl)


/*
  Authentication Routes
*/


routes.use("/mobile/profile",profileCtrl)

///ADDRESS MANAGEMENT
routes.use("/mobile/address",addressCtrl)

//Services 

routes.use("/mobile/services/",serviceCtrl)

//CART MANAGEMENT

routes.use("/mobile/cart/",cartCtrl)


//FAVOURITES MANAGEMENT

routes.use("/mobile/favourite/",favtCtrl)

//COUPANS MANAGEMENT

routes.use("/mobile/coupan/",coupanCtrl)

//ORDERS MANAGEMENT

routes.use("/mobile/orders/",ordersCtrl)


//ORDERS MANAGEMENT

routes.use("/mobile/subscription/",subCtrrl)


//SCHEDULE MANAGEMENT

routes.use("/mobile/schedule/",scheduleCtrl)

//RATING MANAFGEMENT

routes.use("/mobile/rating/",ratingCtrl)



//OTHERS MANAFGEMENT

routes.use("/mobile/",othrCtrl)




//NOTIFICATOIPON


routes.use("/mobile/notification/",notifCtrl)

//COMPANY CTRL

routes.use('/mobile/company',compCtrl);

//TIFFIN CTRL

routes.use('/mobile/tiffin',tiffCtrl);
routes.use('/mobile/tiffin/cart',tiffCartCtrl);
routes.use('/mobile/tiffin/orders',tiffOrderCtrl);
routes.use('/mobile/tiffin/rating',tiffRatingCtrl);


//Recipe Ctrl

routes.use('/mobile/recipe',recpCtrl);
routes.use('/mobile/recipe/like',recpLikeCtrl);
routes.use('/mobile/recipe/comment',recpCommentCtrl);


//REstaurant App routes
routes.use('/mobile/rest',restAppRoutes);

//DSHBOARD DROUTES
routes.use('/company',companyRoutes);


//Delivery DROUTES
routes.use('/delivery',deliveryRoutes);

//Admin DROUTES
routes.use('/admin',adminRoutes);

//Main Admin Routes
routes.use('/main',mainAdminRoutes);




//If No URL found
routes.use((req, res, next) => {

  return responseHelper.error(res, 'Please again check the url,this path is not specified2', 404);
});

module.exports = routes;