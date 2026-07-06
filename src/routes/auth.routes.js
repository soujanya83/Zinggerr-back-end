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
router.route('/change-password').post(verifyJWT, AuthController.changePassword);

router
  .route('/sessions')
  .get(verifyJWT, AuthController.getSessions)
  .delete(verifyJWT, AuthController.revokeAllOtherSessions);

router
  .route('/sessions/:sessionId')
  .get(verifyJWT, AuthController.getSession)
  .delete(verifyJWT, AuthController.revokeSession);

router.route('/onboard-organization').post(
  verifyJWT,
  upload.single('logo'),
  validate(onboardOrganizationSchema),
  AuthController.onboardOrganization
);

router.route('/me').get(verifyJWT, AuthController.getMe);
router
  .route('/selected-organization')
  .get(verifyJWT, AuthController.getSelectedOrg)
  .put(verifyJWT, AuthController.saveSelectedOrg);

export default router;
