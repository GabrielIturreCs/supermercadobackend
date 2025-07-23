const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint real de login
router.post('/login', authController.login);

module.exports = router;
