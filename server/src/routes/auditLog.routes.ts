import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLog.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new AuditLogController();

router.get('/', protect, authorize('admin'), controller.getAll);
router.get('/:model/:id', protect, authorize('admin', 'manager'), controller.getByTarget);

export default router;
