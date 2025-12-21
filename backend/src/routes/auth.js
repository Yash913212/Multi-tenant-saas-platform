const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest, schemas } = require('../utils/validators');

router.post('/register', validateRequest(schemas.register), authController.register);
router.post('/login', validateRequest(schemas.login), authController.login);

module.exports = router;