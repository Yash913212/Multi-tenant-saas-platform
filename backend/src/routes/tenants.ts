import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import { getTenantDetails, updateTenant, listTenants } from '../controllers/tenantController.js';

const router = Router();

router.get('/:tenantId', authenticate, getTenantDetails);

router.put(
  '/:tenantId',
  authenticate,
  [
    body('name').optional().isString(),
    body('status').optional().isIn(['active', 'suspended', 'trial']),
    body('subscriptionPlan').optional().isIn(['free', 'pro', 'enterprise']),
    body('maxUsers').optional().isInt({ min: 1 }),
    body('maxProjects').optional().isInt({ min: 1 }),
    handleValidation,
  ],
  updateTenant
);

router.get('/', authenticate, listTenants);

export default router;
