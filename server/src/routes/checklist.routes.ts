import { Router } from 'express';
import { ChecklistController } from '../controllers/checklist.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new ChecklistController();

router.get('/', protect, authorize('admin', 'manager'), controller.getAll);
router.get('/:id', protect, controller.getById);
router.get('/equipment/:equipmentId', protect, controller.getByEquipment);
router.get('/equipment/:equipmentId/today', protect, controller.checkToday);
router.post('/', protect, controller.create);

export default router;
