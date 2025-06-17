import express from 'express';
import { createMaterial, getAllMaterials } from '../controllers/materialController.js';
// import authMiddleware from '../middleware/authMiddleware.js'; // <<< REMOVE OLD
import { isAuthenticated, authorize } from '../middleware/authorize.js'; // <<< IMPORT NEW

const router = express.Router();

router.use(isAuthenticated); // <<< REPLACE authMiddleware with isAuthenticated

router.get('/', authorize(['view_material_table']), getAllMaterials); // Changed to 'view_material_table'
router.post('/', authorize(['add_material']), createMaterial);   // Changed from ['create_material', 'manage_inventory']

export default router;
