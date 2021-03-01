const db = require('../db/db');

exports.checkDbConnection = () => new Promise((resolve, reject) => {
  db
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
      resolve();
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
      reject();
    });
});