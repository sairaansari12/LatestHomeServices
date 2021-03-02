const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
 db = require('./db/db');
const server = require('http').createServer(app);
config = require('config');

 io = require('socket.io')(server);
const socket = require('./socket')(io);
var cookieParser  = require('cookie-parser');
var flash         = require('connect-flash');
 tc = require("time-slots-generator");

var middleware         = require("./middleware/auth");

checkAuth         = middleware.userAuth
mainAuth          = middleware.mainAuth
adminAuth         = middleware.adminAuth
superAuth         = middleware.superAuth
restAuth          = middleware.restAuth

 sequelize = require('sequelize')
 adminRole =1
const routes = require('./routes/routes');
const checkConn = require('./helpers/checkConn');
const fileUpload = require('express-fileupload');
commonMethods=require('./controllers/api/common/common')
appstrings=require('./language/strings.json')['en']
const cors = require('cors');
const session     = require('express-session');
adminpath="/api/company/"
adminfilepath="admin/"

superadminpath="/api/admin/"
superadminfilepath="super/"


mainpath="/api/main/"
mainfilepath="mainAdmin/"




CURRENCY="Rs."
responseHelper = require("./helpers/responseHelper");
common = require('./helpers/common');

const port = config.PORT || 9066;


app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

var dt = new Date().getTime();
var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  var r = (dt + Math.random()*16)%16 | 0;
  dt = Math.floor(dt/16);
  return (c=='x' ? r :(r&0x3|0x8)).toString(16);
});

app.use(session(
  { secret: config.APP_NAME,
    resave: true,
    saveUninitialized: true,name: uuid}));

app.use((req, res, next) => {
  if (req.session) {
    res.locals.successMessage = req.flash("successMessage");
    res.locals.errorMessage = req.flash("errorMessage");
    res.locals.messages = req.session.messages;
    res.locals.userData = req.session.userData;
    res.locals.userData1 = req.session.userData1;
    res.locals.userDataMain = req.session.userDataMain;

    //res.locals.userId = req.session.userId;
    req.session.messages = {};

  }
  next();
});


app.use(cors());
/*
Increase Upload File Size
*/
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(fileUpload({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));

app.use('/api', routes);
/*
Serve Static Folder
*/
app.use('/', express.static(path.join(__dirname, '/public')));
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



app.get('*', function(req, res) {
  return res.render('admin/partials/norecord.ejs');
});

/*
Check Db connection
*/
const healthCheck = async () => {
  await checkConn.checkDbConnection();
};

/*
Start Server
*/
server.listen(port, async () => {
  await healthCheck();

  console.log(`Listening on port ${port}`);
});





commonMethods.cretaeMainCategory();
commonMethods.generateOrderStatus();
commonMethods.generateUserRoles();
