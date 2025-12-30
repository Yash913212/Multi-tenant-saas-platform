import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import { createProject, listProjects, getProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { enforceProjectLimit } from '../middleware/subscription.js';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty(),
    body('description').optional().isString(),
    body('status').optional().isIn(['active', 'archived', 'completed']),
    handleValidation,
    enforceProjectLimit,
  ],
  createProject
);

router.get('/', authenticate, listProjects);
router.get('/:projectId', authenticate, getProject);

router.put(
  '/:projectId',
  authenticate,
  [
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('status').optional().isIn(['active', 'archived', 'completed']),
    handleValidation,
  ],
  updateProject
);

router.delete('/:projectId', authenticate, deleteProject);

export default router;
