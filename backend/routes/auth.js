// routes/auth.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
