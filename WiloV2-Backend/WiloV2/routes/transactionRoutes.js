import express from 'express';
// import { authenticate } from '../middleware/auth.js'; // <<< REMOVE OLD
import { isAuthenticated, authorize } from '../middleware/authorize.js'; // <<< IMPORT NEW
import {
  createInwardTransaction,
  createConsumptionTransaction,
  getAllTransactions,
  getDailyReport,
  consumeMaterialByQR,
  getMonthlySummary,
  getInwardTransactions,
  getConsumptionTransactions 
} from '../controllers/transactionController.js';

const router = express.Router();

router.use(isAuthenticated);

router.post('/inward', authorize(['adjust_material_stock']), createInwardTransaction);
router.post('/consumption', authorize(['record_consumption']), createConsumptionTransaction);
router.get('/', authorize(['view_consumption_history', 'view_material_stock']), getAllTransactions); // User needs to see either or both
router.get('/reports/daily', authorize(['view_reports']), getDailyReport);
router.get('/reports/monthly', authorize(['view_reports']), getMonthlySummary);
router.post('/consume-qr', authorize(['record_consumption', 'scan_barcode']), consumeMaterialByQR);
router.get('/inward', authorize(['view_material_stock']), getInwardTransactions);
router.get('/consumption', authorize(['view_consumption_history']), getConsumptionTransactions);

export default router;
