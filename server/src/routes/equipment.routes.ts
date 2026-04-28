import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new EquipmentController();

router.get('/', protect, controller.getAll);
router.get('/:id', protect, controller.getById);
router.post('/', protect, authorize('admin', 'manager'), controller.create);
router.put('/:id', protect, authorize('admin', 'manager'), controller.update);
router.delete('/:id', protect, authorize('admin'), controller.delete);

export default router;
