import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
// import { authenticate } from '../middleware/auth.js'; // <<< REMOVE OLD
import { isAuthenticated, authorize } from '../middleware/authorize.js'; // <<< IMPORT NEW

const router = express.Router();
router.use(isAuthenticated); // <<< REPLACE authenticate with isAuthenticated

router.get('/', authorize(['view_dashboard']), getDashboardStats);

export default router;