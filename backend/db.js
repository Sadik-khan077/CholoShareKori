const mysql = require('mysql2/promise');

// Create a connection pool to the Docker MySQL container
const pool = mysql.createPool({
  host: 'database', // This matches the service name in docker-compose.yml
  user: 'user',
  password: 'password',
  database: 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;