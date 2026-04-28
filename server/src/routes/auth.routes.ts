import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login);
router.get('/me', protect, controller.getMe);

export default router;
