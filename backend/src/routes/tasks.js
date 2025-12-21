const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest, schemas } = require('../utils/validators');

router.post('/', authMiddleware, validateRequest(schemas.createTask), taskController.createTask);
router.get('/', authMiddleware, taskController.listTasks);
router.get('/:id', authMiddleware, taskController.getTask);
router.patch('/:id', authMiddleware, validateRequest(schemas.updateTask), taskController.updateTask);
router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;