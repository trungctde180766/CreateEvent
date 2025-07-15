const express = require('express');
const AuthController = require('../controllers/authController');
const router = express.Router();

router.post('/register', AuthController.register);

router.post('/login', AuthController.login);

router.post('/logout', AuthController.logout);

router.get('/me', AuthController.getCurrentUser);

module.exports = router;