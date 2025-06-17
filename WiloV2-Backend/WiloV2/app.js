import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env'); 
dotenv.config({ path: envPath }); 

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './config/passport.js';
import { poolConnect } from './config/db.js';

// Import your chosen authentication middleware
import { authenticate } from './middleware/auth.js'; // Using authenticate from auth.js - REMOVE OR COMMENT OUT
import { isAuthenticated } from './middleware/authorize.js'; // <<< ADD THIS LINE
import { getAllMaterials } from './controllers/materialController.js';

// Route imports
import materialRoutes from './routes/materialRoutes.js';
import authRoutes from './routes/authRoutes.js'; // Public routes
import transactionRoutes from './routes/transactionRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js'; // <<< ADD THIS LINE
import categoryRoutes from './routes/categoryRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import roleMasterRoutes from './routes/roleMasterRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import barcodeRoutes from './routes/barcodeRoutes.js';
import testRoutes from './routes/testRoutes.js'; // Import the new test routes

import reportRoutes from './routes/reportRoutes.js';
import userManagementRoutes from './routes/userManagementRoutes.js';
import userRoutes from './routes/userRoutes.js';
import consumeRoutes from './routes/consumeRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js'; // Import workspace routes

import errorHandler from './middleware/errorHandler.js';

import db from './models/index.js'; // Import your db object

  const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:4200','http://192.168.1.96:4200'], // Allows requests from your Angular app
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Add Content Security Policy header
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' http://localhost:5000;"
  );
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Root route (public)
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('http://localhost:4200/material-table');
  } else {
    res.send('Logged out');
  }
});

// Public routes (authentication, registration, OAuth callbacks)
// Mount auth routes under /api/auth to match frontend calls
app.use('/api/auth', authRoutes); 

// Static assets (public)
app.use('/barcodes', express.static(path.join(__dirname, '..', 'public', 'barcodes')));

// Apply authentication middleware to all /api routes
// app.use('/api', authenticate); // REMOVE OR COMMENT OUT
app.use('/api', isAuthenticated); // <<< REPLACE WITH THIS LINE

// Register API routes (they will inherit the /api prefix and the authenticate middleware)
app.use('/api/materials', materialRoutes);
app.get('/api/material-table-data', authenticate, getAllMaterials);
app.use('/api/transactions', transactionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/print-barcode', barcodeRoutes);
app.use('/api', testRoutes); // Mount the new test routes under /api

app.use('/api/reports', reportRoutes);
app.use('/api/user-management', userManagementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/consume', consumeRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/workspace', workspaceRoutes); // Register workspace routes
app.use('/api/rolemaster', roleMasterRoutes); 

// Error handler should be last
app.use(errorHandler);

poolConnect
  .then(() => console.log('Connected to SQL Server'))
  .catch(err => console.error('Database connection failed:', err));

// Initialize Sequelize and start server
async function startServer() {
  try {
    await db.sequelize.authenticate(); 
    console.log('Connection has been established successfully.');

    // Comment out or remove the sync call if your schema is established
    // await db.sequelize.sync({ alter: true }); 
    // console.log('All models were synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1); // Exit if DB connection fails
  }
}

startServer();

