import express from 'express';
import { getAllDepartments } from '../controllers/departmentController.js';
import { isAuthenticated, authorize } from '../middleware/authorize.js'; // <<< IMPORT

const router = express.Router();
router.use(isAuthenticated);

router.get('/', authorize(['manage_departments']), getAllDepartments); // Assuming 'manage_departments' permission exists or will be created

export default router;
