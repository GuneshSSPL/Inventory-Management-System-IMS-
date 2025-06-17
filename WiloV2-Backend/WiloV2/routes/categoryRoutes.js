import express from 'express';
import { getAllCategories, createCategory } from '../controllers/categoryController.js';
// import { authenticate } from '../middleware/auth.js'; // <<< REMOVE OLD
import { isAuthenticated, authorize } from '../middleware/authorize.js'; // <<< IMPORT NEW

const router = express.Router();

router.use(isAuthenticated);

router.get('/', authorize(['manage_categories']), getAllCategories);
router.post('/', authorize(['manage_categories']), createCategory);
// If you have PUT and DELETE, they would also use ['manage_categories']

export default router;
