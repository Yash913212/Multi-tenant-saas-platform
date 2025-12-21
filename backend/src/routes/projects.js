const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest, schemas } = require('../utils/validators');

router.post('/', authMiddleware, validateRequest(schemas.createProject), projectController.createProject);
router.get('/', authMiddleware, projectController.listProjects);
router.get('/:id', authMiddleware, projectController.getProject);
router.patch('/:id', authMiddleware, validateRequest(schemas.updateProject), projectController.updateProject);
router.delete('/:id', authMiddleware, projectController.deleteProject);

module.exports = router;