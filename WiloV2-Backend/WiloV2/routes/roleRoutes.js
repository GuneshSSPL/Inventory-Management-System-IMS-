// /routes/roleRoutes.js
import express from 'express';
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions
} from '../controllers/roleController.js';
import { isAuthenticated, authorize } from '../middleware/authorize.js'; // <<< IMPORT MIDDLEWARE

const router = express.Router();

// Apply isAuthenticated to all role routes first
router.use(isAuthenticated);

router.post('/', authorize(['add_role']), createRole);
router.get('/', authorize(['view_roles']), getAllRoles);
router.get('/:id', authorize(['view_roles']), getRoleById);
router.put('/:id', authorize(['edit_role']), updateRole);
router.delete('/:id', authorize(['delete_role']), deleteRole);

router.post('/:roleId/permissions/:permissionId', authorize(['manage_role_permissions']), assignPermissionToRole);
router.delete('/:roleId/permissions/:permissionId', authorize(['manage_role_permissions']), removePermissionFromRole);
router.get('/:roleId/permissions', authorize(['manage_role_permissions']), getRolePermissions); // Or 'view_roles' if seeing permissions is part of viewing a role

export default router;
