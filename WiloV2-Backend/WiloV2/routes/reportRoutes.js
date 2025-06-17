import express from 'express';
import { getCustomReport, exportPDFReport } from '../controllers/reportController.js';
import { isAuthenticated, authorize } from '../middleware/authorize.js'; // <<< IMPORT

const router = express.Router();
router.use(isAuthenticated);

router.get('/custom', authorize(['view_reports']), getCustomReport);
router.get('/export-pdf', authorize(['view_reports']), exportPDFReport); // Simplified, or use a specific generate_..._report if applicable

export default router;