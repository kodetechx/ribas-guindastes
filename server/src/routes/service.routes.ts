import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new ServiceController();

router.get('/', protect, authorize('admin', 'manager'), controller.getAll);
router.get('/:id', protect, authorize('admin', 'manager'), controller.getById);
router.get('/operator/:operatorId', protect, controller.getByOperator);
router.post('/', protect, controller.create);
router.put('/:id', protect, controller.update);
router.delete('/:id', protect, authorize('admin', 'manager'), controller.delete);
router.post('/:id/occurrences', protect, controller.addOccurrence);
router.post('/validate-equipment', protect, authorize('admin', 'manager'), controller.validateEquipment);
router.post('/validate-operator', protect, authorize('admin', 'manager'), controller.validateOperator);

export default router;
