import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  assignUserPermissionsSchema,
  createUserSchema,
  updateUserSchema,
} from '../validations/user.validation.js';

const router = Router();

// Protect all user routes
router.use(verifyJWT);

router
  .route('/')
  .post(validate(createUserSchema), UserController.createUser)
  .get(UserController.getUsers);

router.route('/permissions').get(UserController.getMergedPermissions);
router.route('/organizations').get(UserController.getAssociatedOrganizations);

router
  .route('/:id')
  .get(UserController.getUserById)
  .put(validate(updateUserSchema), UserController.updateUser)
  .delete(UserController.deleteUser);

router.patch('/:id/status', UserController.toggleUserStatus);

router
  .route('/:id/permissions')
  .put(validate(assignUserPermissionsSchema), UserController.assignPermissions);

export default router;
