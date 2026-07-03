import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { assignUserPermissionsSchema } from '../validations/user.validation.js';

const router = Router();

// Protect all user routes
router.use(verifyJWT);

router
  .route('/:id/permissions')
  .put(validate(assignUserPermissionsSchema), UserController.assignPermissions);

export default router;
