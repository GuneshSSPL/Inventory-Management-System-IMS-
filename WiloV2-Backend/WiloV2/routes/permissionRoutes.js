import express from 'express';
import {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
} from '../controllers/permissionController.js';
import { isAuthenticated, authorize } from '../middleware/authorize.js';

const router = express.Router();
router.use(isAuthenticated);

router.post('/', authorize(['manage_permissions']), createPermission);
router.get('/', authorize(['manage_permissions']), getAllPermissions);
router.get('/:id', authorize(['manage_permissions']), getPermissionById);
router.put('/:id', authorize(['manage_permissions']), updatePermission);
router.delete('/:id', authorize(['manage_permissions']), deletePermission);

export default router;