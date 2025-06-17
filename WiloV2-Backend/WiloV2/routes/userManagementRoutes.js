import express from 'express';
import { 
  assignDepartment, // Assuming this controller exists and handles department assignment to a user
  getRoles,         // For fetching a list of roles (e.g., to populate a dropdown for assignment)
  assignRole,       // For assigning a role to a user
  getUsers          // For fetching a list of users (perhaps for management purposes)
} from '../controllers/userManagementController.js';
import { isAuthenticated, authorize } from '../middleware/authorize.js';

const router = express.Router();
router.use(isAuthenticated);

// Assign department to a user; consider a specific permission or use 'edit_user'
router.post('/assign-department', authorize(['edit_user']), assignDepartment); // Changed, assuming 'edit_user' covers this

// Get all roles (e.g., for a UI to assign roles); requires 'view_roles'
router.get('/roles', authorize(['view_roles']), getRoles); // Changed from ['read_roles', 'manage_roles', 'manage_users']

// Get users; requires 'view_users'
router.get('/getUsers', authorize(['view_users']), getUsers);  // Changed from ['read_users', 'manage_users']

// Assign a role to a user; requires 'assign_roles'
router.post('/assign-role', authorize(['assign_roles']), assignRole); // Changed from ['assign_user_role', 'manage_users', 'manage_roles']

export default router;

