/**
 * @file db.config.js
 * @description MySQL connection pool configuration using environment variables.
 */

import mysql from 'mysql2/promise';

/** MySQL connection pool instance */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default db;