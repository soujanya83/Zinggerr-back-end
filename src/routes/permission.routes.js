import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createPermissionSchema,
  updatePermissionSchema,
} from '../validations/permission.validation.js';

const router = Router();

// Protect all permission routes
router.use(verifyJWT);

router
  .route('/')
  .post(validate(createPermissionSchema), PermissionController.createPermission)
  .get(PermissionController.getAllPermissions);

router
  .route('/:id')
  .get(PermissionController.getPermissionById)
  .put(validate(updatePermissionSchema), PermissionController.updatePermission)
  .delete(PermissionController.deletePermission);

export default router;
