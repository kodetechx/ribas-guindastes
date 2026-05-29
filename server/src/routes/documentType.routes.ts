import { Router } from 'express';
import { DocumentTypeController } from '../controllers/documentType.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new DocumentTypeController();

router.get('/', protect, controller.getAll);
router.get('/active', protect, controller.getActive);
router.post('/', protect, authorize('admin', 'manager'), controller.create);
router.put('/:id', protect, authorize('admin', 'manager'), controller.update);
router.delete('/:id', protect, authorize('admin'), controller.delete);

export default router;
