import express from 'express';
import {
  assignRoleToUser,
  getAllUsersForRoleMaster,
  getAllRolesForRoleMaster
} from '../controllers/roleMasterController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Corrected import
import { isAdmin } from '../middleware/roleMiddleware.js'; // Assuming you have this for admin checks

const router = express.Router();

// Assign role to user (Admin only)
// The isAdmin middleware should check if req.user.role is 'Admin' or similar
router.post('/assign-role', authMiddleware, isAdmin, assignRoleToUser);

// Get all users for RoleMaster (Admin only)
router.get('/users', authMiddleware, isAdmin, getAllUsersForRoleMaster);

// Get all roles for RoleMaster (Admin only)
router.get('/roles', authMiddleware, isAdmin, getAllRolesForRoleMaster);

export default router;