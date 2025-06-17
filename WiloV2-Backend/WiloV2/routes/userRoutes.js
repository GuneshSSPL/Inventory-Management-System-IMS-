import express from 'express';
import { getCurrentUser, getAllUsers, updateUserRole } from '../controllers/userController.js';
// Updated import to use the new RBAC middleware
import { isAuthenticated, authorize } from '../middleware/authorize.js'; 

const router = express.Router();

// Protect all routes in this file with authentication
router.use(isAuthenticated);

// Get current user profile - generally, any authenticated user can access their own profile
// No specific permission needed beyond being authenticated.
router.get('/me', getCurrentUser);

// List all users; requires 'view_users' permission
router.get('/', authorize(['view_users']), getAllUsers); // Changed from ['read_users', 'manage_users']

// Update user role; requires 'assign_roles' permission (or 'edit_user' if it implies role changes)
router.put('/:id/role', authorize(['assign_roles']), updateUserRole); // Changed from ['update_user_role', 'manage_users']

export default router;
