import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new StatsController();

router.get('/dashboard', protect, authorize('admin', 'manager'), controller.getDashboardStats);

export default router;
