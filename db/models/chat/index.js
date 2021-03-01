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
  require('./groups.js'),
  require('./groupMembers.js'),
  require('./chatMessages.js'),
  require('./textMessages.js'),
  require('./mediaMessages.js'),
  // require('./messagesStatus.js'),
  // require('./clearedMessages.js'),
];

// Initialize models
modules.forEach((module) => {
  const model = module(sequelize, Sequelize, config);
  model.sync(true);
  models[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = models;
