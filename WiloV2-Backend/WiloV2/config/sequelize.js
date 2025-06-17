// ./config/sequelize.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules, __dirname is not available directly, so we derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the parent directory (WiloV2) relative to this config file
// This assumes your .env file is in c:\IMS\IMS-main\WiloV2-Backend\WiloV2\.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- Optional Debug Logs (can be removed or commented out in production) ---
// console.log("--- Sequelize Configuration --- Env Variables ---");
// console.log("DB_NAME:", process.env.DB_NAME);
// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "********" : "Not Set");
// console.log("DB_HOST:", process.env.DB_HOST);
// console.log("DB_PORT (raw from .env):", process.env.DB_PORT);
// --- End Debug Logs ---

const dbPort = parseInt(process.env.DB_PORT) || 1433;

const sequelize = new Sequelize(
  process.env.DB_NAME,    // Database name
  process.env.DB_USER,    // Database username
  process.env.DB_PASSWORD,  // Database password
  {
    host: process.env.DB_HOST, // Database host (e.g., 'localhost', 'your-server.database.windows.net')
    port: dbPort,              // Database port
    dialect: 'mssql',
    dialectOptions: {
      options: {
        // Encrypt true is generally recommended, especially for cloud databases like Azure SQL.
        // For local SQL Server instances, you might not need it or might need to configure SQL Server for SSL.
        encrypt: process.env.DB_ENCRYPT === 'true', // Control via .env; defaults to false if not 'true'
        // For local development with self-signed certificates or if not using SSL, 
        // trustServerCertificate can be true. For production with a valid CA certificate, set to false.
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' // Control via .env
      }
    },
    pool: {
      max: 5,           // Maximum number of connections in pool
      min: 0,           // Minimum number of connections in pool
      acquire: 30000,   // Maximum time (ms) to try getting a connection before throwing an error
      idle: 10000       // Maximum time (ms) that a connection can be idle before being released
    },
    // Logging can be set to console.log to see SQL queries, or false to disable.
    // For production, consider a more sophisticated logging setup or disabling it.
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

export default sequelize;
