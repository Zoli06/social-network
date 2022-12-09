const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  connectionLimit: 8,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  namedPlaceholders: true,
});

module.exports = {
  query: async (query, args) => {
    const connection = await pool.promise().getConnection();
    result = await connection.query(query, args);
    connection.release();
    return result;
  },
};
