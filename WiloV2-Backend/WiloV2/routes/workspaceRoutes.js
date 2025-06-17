import express from 'express';
import { authorize } from '../middleware/authorize.js';
import { createWorkspace, getAllWorkspaces, getWorkspaceById, updateWorkspace, deleteWorkspace } from '../controllers/workspaceController.js';

const router = express.Router();

// Routes for Workspace
router.post('/', authorize(['create_workspace']), createWorkspace);
router.get('/', authorize(['view_workspace']), getAllWorkspaces);
router.get('/:id', authorize(['view_workspace']), getWorkspaceById);
router.put('/:id', authorize(['update_workspace']), updateWorkspace);
router.delete('/:id', authorize(['delete_workspace']), deleteWorkspace);

export default router;