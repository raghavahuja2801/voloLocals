// routes/admin.js
const express = require('express');
const router  = express.Router();
const authenticate    = require('../middleware/authenticate');
const authorizeRoles  = require('../middleware/authorize');
const { setUserRole, getAllUsers } = require('../controllers/adminController');

// Only authenticated admins can use these routes
router.use(authenticate);

// Promote/demote a user
router.post('/users/:uid/role', authorizeRoles('admin') ,setUserRole);
// Get all users (for admin dashboard)
router.get('/users', authorizeRoles('admin'), getAllUsers);

module.exports = router;
