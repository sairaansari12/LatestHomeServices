const Sequelize = require('sequelize');
 config = require('config').db;
const models = require('./models');

// const firebase = require('firebase');
// const firebaseApp = firebase.initializeApp(config.firebase);

 const db = new Sequelize(config.database, config.username, config.password,
   {
  host: config.host,
  dialect: config.dialect,
  pool: config.pool
  
  }
);

db.connectionManager.disconnect = connection => ({
  tap: (method) => connection.end().then(method),
})


 db.models = models;
//db.sync({force: true});

module.exports = db;