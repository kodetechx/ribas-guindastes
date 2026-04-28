import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/document.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = new DocumentController();
const upload = multer({ dest: 'uploads/' });

router.get('/:category/:ownerId', protect, controller.getByOwner);
router.post('/', protect, authorize('admin', 'manager'), upload.single('file'), controller.upload);

export default router;
