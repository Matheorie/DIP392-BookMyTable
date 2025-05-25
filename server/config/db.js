// server/config/db.js
// Configuration de la connexion à la base de données

const mysql = require('mysql2/promise');
const config = require('./config');

// Création du pool de connexions
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de la connexion
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    return false;
  }
}

// Exécuter une requête SQL
async function query(sql, params) {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection
};
