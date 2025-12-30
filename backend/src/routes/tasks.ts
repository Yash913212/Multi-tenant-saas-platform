import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import { createTask, listTasks, updateTaskStatus, updateTask } from '../controllers/taskController.js';

const router = Router();

router.post(
  '/projects/:projectId/tasks',
  authenticate,
  [
    body('title').notEmpty(),
    body('description').optional().isString(),
    body('assignedTo').optional().isString(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional().isISO8601(),
    handleValidation,
  ],
  createTask
);

router.get('/projects/:projectId/tasks', authenticate, listTasks);

router.patch(
  '/tasks/:taskId/status',
  authenticate,
  [body('status').isIn(['todo', 'in_progress', 'completed']), handleValidation],
  updateTaskStatus
);

router.put(
  '/tasks/:taskId',
  authenticate,
  [
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('status').optional().isIn(['todo', 'in_progress', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('assignedTo').optional({ nullable: true }).isString(),
    body('dueDate').optional({ nullable: true }).isISO8601(),
    handleValidation,
  ],
  updateTask
);

export default router;
