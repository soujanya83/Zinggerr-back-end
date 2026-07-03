import { Router } from 'express';
import { RoleController } from '../controllers/role.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createRoleSchema,
  updateRoleSchema,
  assignRolePermissionsSchema,
} from '../validations/role.validation.js';

const router = Router();

// Protect all role routes
router.use(verifyJWT);

router
  .route('/')
  .post(validate(createRoleSchema), RoleController.createRole)
  .get(RoleController.getAllRoles);

router
  .route('/:id')
  .get(RoleController.getRoleById)
  .put(validate(updateRoleSchema), RoleController.updateRole)
  .delete(RoleController.deleteRole);

router
  .route('/:id/permissions')
  .put(validate(assignRolePermissionsSchema), RoleController.assignPermissions);

export default router;
