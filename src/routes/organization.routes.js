import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller.js';
import { verifyJWT, checkSuperAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '../validations/organization.validation.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Protect all organization routes: Must be logged in AND hold the SuperAdmin role
router.use(verifyJWT, checkSuperAdmin);

router
  .route('/')
  .post(upload.single('logo'), validate(createOrganizationSchema), OrganizationController.createOrganization)
  .get(OrganizationController.getAllOrganizations);

router
  .route('/:id')
  .get(OrganizationController.getOrganizationById)
  .put(upload.single('logo'), validate(updateOrganizationSchema), OrganizationController.updateOrganization)
  .delete(OrganizationController.deleteOrganization);

export default router;
