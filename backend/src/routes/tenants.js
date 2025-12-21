const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authMiddleware, superAdminOnly } = require('../middleware/auth');
const { validateRequest, schemas } = require('../utils/validators');

router.post('/', authMiddleware, superAdminOnly, validateRequest(schemas.createTenant), tenantController.createTenant);
router.get('/:id', authMiddleware, tenantController.getTenant);
router.patch('/:id', authMiddleware, superAdminOnly, validateRequest(schemas.updateTenant), tenantController.updateTenant);

module.exports = router;