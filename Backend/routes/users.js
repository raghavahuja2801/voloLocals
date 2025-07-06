const express = require('express');
const authenticate = require('../middleware/authenticate');
const {
  getProfile,
  updateProfile,
  deleteProfile
} = require('../controllers/userController');

const router = express.Router();
router.use(authenticate);

// GET   /api/users/me
router.get('/me', authenticate, getProfile);


// PATCH /api/users/me
router.patch('/me', updateProfile);

// DELETE /api/users/me
router.delete('/me', deleteProfile);

module.exports = router;
