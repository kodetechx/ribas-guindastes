import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new ServiceController();

router.get('/', protect, authorize('admin', 'manager'), controller.getAll);
router.get('/operator/:operatorId', protect, controller.getByOperator);
router.post('/', protect, controller.create);
router.put('/:id', protect, controller.update);

export default router;
