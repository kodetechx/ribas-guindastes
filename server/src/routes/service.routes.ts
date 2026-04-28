import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new ServiceController();

router.get('/', protect, authorize('admin', 'manager'), controller.getAll);
router.post('/', protect, authorize('admin', 'manager'), controller.create);
router.put('/:id', protect, authorize('admin', 'manager'), controller.update);

export default router;
