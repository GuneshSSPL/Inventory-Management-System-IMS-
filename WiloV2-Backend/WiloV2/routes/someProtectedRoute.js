import express from 'express';
import { authorize, isAuthenticated } from '../middleware/authorize.js'; // Adjust path as needed
// ... import your controllers ...

const router = express.Router();

// Example: Route requiring 'read_users' permission
router.get('/users', isAuthenticated, authorize(['read_users']), getAllUsers); // Assuming getAllUsers is your controller

// Example: Route requiring 'create_role' and 'assign_permission' permissions
router.post('/roles', isAuthenticated, authorize(['create_role', 'assign_permission']), createRole); // Assuming createRole is your controller

// Example: Route only requiring authentication, not specific permissions
router.get('/profile', isAuthenticated, getCurrentUserProfile); // Assuming getCurrentUserProfile is your controller

// For an admin user (like test@example.com with RoleID 13) to have all access:
// The current authorize middleware has a check for role 'Admin' or email 'test@example.com' with RoleID 13.
// Ensure the RoleName for RoleID 13 is 'Admin' in your database and is correctly included in the JWT.
// If so, this user will bypass the specific permission checks in authorize(['some_permission']).

export default router;