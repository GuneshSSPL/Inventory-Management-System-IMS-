import express from 'express';
import { printBarcode } from '../controllers/barcodeController.js';
import { isAuthenticated, authorize } from '../middleware/authorize.js'; // <<< IMPORT

const router = express.Router();

// Apply isAuthenticated to all barcode routes
router.use(isAuthenticated);

router.post('/', authorize(['print_barcode']), printBarcode); // Changed

export default router;
