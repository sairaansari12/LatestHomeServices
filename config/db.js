module.exports = {
  development: {
    username: 'root',
    password: 'pW8c6sGXahv',
    // database: 'fooddeliveryservicesvAdmin',
    database: 'multidelivery',

    host: '10.8.14.242',
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4'
    },
    connectionLimit: 10,
    connectionTimeout: 10000,
    requestTimeout: 10000,
    pool: {
      max: 5,
      min:0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_general_ci'
      }
    }
  },
 
};

