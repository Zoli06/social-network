import * as mysql from 'mysql2';

const pool = mysql.createPool({
  connectionLimit: 8,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  namedPlaceholders: true,
});

// check connection
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    }
    console.error(err);
  } else {
    console.log('Connected to database');
  }
  if (connection) connection.release();
  return;
});

export default {
  query: async (query: string, args: string[]) => {
    const connection = await pool.promise().getConnection();
    const result = await connection.query(query, args);
    connection.release();
    return result;
  }
};
