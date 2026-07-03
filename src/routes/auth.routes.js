import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  signupSchema,
  signinSchema,
  onboardOrganizationSchema,
} from '../validations/auth.validation.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Public routes
router.route('/signup').post(validate(signupSchema), AuthController.signup);
router.route('/signin').post(validate(signinSchema), AuthController.signin);
router.route('/refresh-token').post(AuthController.refreshAccessToken);

// Protected routes
router.route('/logout').post(verifyJWT, AuthController.logout);
router.route('/onboard-organization').post(
  verifyJWT,
  upload.single('logo'),
  validate(onboardOrganizationSchema),
  AuthController.onboardOrganization
);

export default router;
