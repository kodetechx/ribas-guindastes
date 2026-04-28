import { Router } from 'express';
import { OperatorController } from '../controllers/operator.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new OperatorController();

router.get('/', protect, authorize('admin', 'manager'), controller.getAll);
router.get('/:id', protect, controller.getById);
router.post('/', protect, authorize('admin'), controller.create);
router.put('/:id', protect, authorize('admin', 'manager'), controller.update);
router.delete('/:id', protect, authorize('admin'), controller.delete);

export default router;
