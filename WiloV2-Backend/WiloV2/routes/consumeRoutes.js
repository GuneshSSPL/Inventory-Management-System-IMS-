import express from 'express';
import { consumeMaterial,getMaterialByCode , getAllMaterials} from '../controllers/consumeController.js';
import { isAuthenticated, authorize } from '../middleware/authorize.js'; // <<< IMPORT

const router = express.Router();
router.use(isAuthenticated);

router.post('/', authorize(['record_consumption']), consumeMaterial);
router.get('/', authorize(['view_materials']), getAllMaterials);
router.get('/:code', authorize(['view_materials']), getMaterialByCode);

export default router;
