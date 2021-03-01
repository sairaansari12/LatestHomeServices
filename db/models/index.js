'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../config/db.js')[env];
const db = {};

let sequelize;
let models = {};

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

let modules = [
  require('./companies.js'),
  require('./employee.js'), 
  require('./users.js'),
  require('./address'),  
  require('./banners'), 
  require('./orders'), 
  require('./suborders'), 
  require('./assignedEmployees'), 
  require('./payment'), 
  require('./cart'), 
  require('./schedule'), 
  require('./favourites'), 
  require('./coupan'), 
  require('./categories'), 
  require('./document'), 
  require('./services'), 
  require('./faqCategory'), 
  require('./faq'), 
  require('./tags'),
  require('./notifications'), 
  require('./contactus'), 
  require('./cancelReason'), 
  require('./userType'), 
  require('./roleTypes'), 
  require('./businessType'), 
  require('./orderStatus'), 
  require('./companyRatings'), 
  require('./serviceRatings'),
  require('./subscription'), 
  require('./subscriptionDuration'), 
  require('./userSubscription'), 
  require('./deals'),
  require('./shipment'),
  require('./instructions'),
  require('./plans'),
  require('./staffRoles'),
  require('./staffRatings'),
  require('./comission'),
  require('./comissionHistory'),
  require('./paymentSetup'),
  require('./gallery'),
  require('./appRatings'),
  require('./tiffin/tiffinServices'),
  require('./tiffin/tiffinMenu'),
  require('./tiffin/tiffinPackages'),
  require('./tiffin/tiffinCart'),
  require('./tiffin/tiffinOrders'),
  require('./tiffin/tiffinInstructions'),
  require('./tiffin/tiffinPayment'),
  require('./tiffin/tiffinAssignedEmp'),
  require('./tiffin/tiffinRatings'),
  require('./recipe/recipeCategories'),
  require('./recipe/recipes'),
  require('./recipe/recipeMedia'),
  require('./recipe/recipeLike'),
  require('./recipe/recipeComment'),
  require('./staffWallet'),
  require('./permissions'),
  require('./chat/groups.js'),
  require('./chat/groupMembers.js'),
  require('./chat/chatMessages.js'),
  require('./chat/textMessages.js'),
  require('./chat/mediaMessages.js'),
  require('./trials'),
  require('./trialSubscription'),
  require('./userInformation'),
  require('./filters'),
  require('./lpHistory')


  




];

// Initialize models
modules.forEach((module) => {
  const model = module(sequelize, Sequelize, config);
  model.sync(true);
 // model.sync(true);
  models[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);

  }
});

module.exports = models;
