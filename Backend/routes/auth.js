// routes/auth.js
const express = require('express');
const router  = express.Router();
const { register, getProfile, login, logout } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

// Public: register and login
router.post('/register', register);
router.post('/login',    login);
router.get('/profile',authenticate, getProfile);
router.post('/logout', authenticate, logout);
// Admin: get all users (for admin dashboard)
// router.get('/users', authenticate, adminController.getAllUsers); // Uncomment if you have an admin controller


module.exports = router;
