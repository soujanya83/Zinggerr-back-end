import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/start', verifyJWT, UploadController.startUpload);
router.post('/presign-parts', verifyJWT, UploadController.getPresignedUrls);
router.post('/complete', verifyJWT, UploadController.completeUpload);
router.post('/abort', verifyJWT, UploadController.abortUpload);

export default router;
