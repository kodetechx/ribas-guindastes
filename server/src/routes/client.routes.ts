import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new ClientController();

router.get('/', protect, controller.getAll);
router.get('/:id', protect, controller.getById);
router.post('/', protect, authorize('admin', 'manager'), controller.create);
router.put('/:id', protect, authorize('admin', 'manager'), controller.update);
router.delete('/:id', protect, authorize('admin'), controller.delete);

export default router;
