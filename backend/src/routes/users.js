const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, tenantAdminOrOwner } = require('../middleware/auth');
const { validateRequest, schemas } = require('../utils/validators');

router.post('/', authMiddleware, tenantAdminOrOwner, validateRequest(schemas.createUser), userController.createUser);
router.get('/', authMiddleware, userController.listUsers);
router.get('/:id', authMiddleware, userController.getUser);
router.patch('/:id', authMiddleware, validateRequest(schemas.updateUser), userController.updateUser);
router.delete('/:id', authMiddleware, tenantAdminOrOwner, userController.deleteUser);

module.exports = router;