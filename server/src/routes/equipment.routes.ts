import { Router } from 'express';
import multer from 'multer';
import { EquipmentController } from '../controllers/equipment.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new EquipmentController();
const upload = multer({ dest: 'uploads/' });

router.get('/', protect, controller.getAll);
router.get('/:id', protect, controller.getById);
router.post('/', protect, authorize('admin', 'manager'), upload.single('file'), controller.create);
router.put('/:id', protect, authorize('admin', 'manager'), upload.single('file'), controller.update);
router.delete('/:id', protect, authorize('admin'), controller.delete);

export default router;
