import express from 'express';
import {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
} from '../controllers/supplierController.js';
import { isAuthenticated, authorize } from '../middleware/authorize.js';

const router = express.Router();

// All supplier routes will require authentication
router.use(isAuthenticated);

// Define routes with authorization - all using 'view_suppliers' for simplicity
router.post('/', authorize(['view_suppliers']), createSupplier);
router.get('/', authorize(['view_suppliers']), getAllSuppliers);
router.get('/:id', authorize(['view_suppliers']), getSupplierById);
router.put('/:id', authorize(['view_suppliers']), updateSupplier);
router.delete('/:id', authorize(['view_suppliers']), deleteSupplier);

export default router;
