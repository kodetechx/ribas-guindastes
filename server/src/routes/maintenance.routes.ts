import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { logAction } from '../middleware/audit.middleware';

const router = Router();
const controller = new MaintenanceController();

router.get('/', protect, authorize('admin', 'manager'), controller.getAll);
router.get('/:id', protect, controller.getById);
router.get('/equipment/:equipmentId', protect, controller.getByEquipment);
router.post('/', protect, authorize('admin', 'manager'), logAction('Maintenance'), controller.create);
router.put('/:id', protect, authorize('admin', 'manager'), logAction('Maintenance'), controller.update);
router.delete('/:id', protect, authorize('admin'), logAction('Maintenance'), controller.delete);

export default router;
