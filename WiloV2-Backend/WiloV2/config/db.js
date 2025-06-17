import sql from 'mssql';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'sipamara',
  database: process.env.DB_NAME || 'WilloV2',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000 // Move requestTimeout here
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000
    // Removed unsupported options:
    // requestTimeout, connectionRetryInterval, maxRetriesPerRequest
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

// Add error handling for connection
poolConnect.catch(err => {
  console.error('Database connection error:', err);
});

export { sql, pool, poolConnect };
