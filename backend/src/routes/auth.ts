import { Router } from 'express';
import { body } from 'express-validator';
import { registerTenant, login, me, logout } from '../controllers/authController.js';
import { handleValidation } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register-tenant',
  [
    body('tenantName').notEmpty(),
    body('subdomain').matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/),
    body('adminEmail').isEmail(),
    body('adminPassword').isLength({ min: 8 }),
    body('adminFullName').notEmpty(),
    handleValidation,
  ],
  registerTenant
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
    body('tenantSubdomain').optional().isString(),
    body('tenantId').optional().isString(),
    handleValidation,
  ],
  login
);

router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
