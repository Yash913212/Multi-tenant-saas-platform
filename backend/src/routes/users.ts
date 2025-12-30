import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import { addUser, listUsers, updateUser, deleteUser } from '../controllers/userController.js';

const router = Router();

router.post(
  '/tenants/:tenantId/users',
  authenticate,
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('fullName').notEmpty(),
    body('role').optional().isIn(['user', 'tenant_admin']),
    handleValidation,
  ],
  addUser
);

router.get('/tenants/:tenantId/users', authenticate, listUsers);

router.put(
  '/users/:userId',
  authenticate,
  [
    body('fullName').optional().isString(),
    body('role').optional().isIn(['user', 'tenant_admin']),
    body('isActive').optional().isBoolean(),
    handleValidation,
  ],
  updateUser
);

router.delete('/users/:userId', authenticate, deleteUser);

export default router;
