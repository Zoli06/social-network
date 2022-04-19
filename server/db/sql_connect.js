const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
});

connection.connect(function (err) {
  if (err) {
    console.error('Error connecting to db: ' + err.stack);
    return;
  }
  console.log('Connected to db as id ' + connection.threadId);
});

connection.config.namedPlaceholders = true;

module.exports = connection;