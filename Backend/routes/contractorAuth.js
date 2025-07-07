// routes/contractorAuth.js
const express = require('express');
const router = express.Router();
const {
  registerContractor,
  loginContractor,
  getContractorProfile,
  logoutContractor,
  updateContractorProfile
} = require('../controllers/contractorAuthController');
const authenticate = require('../middleware/authenticate');

// Public routes
router.post('/register', registerContractor);
router.post('/login', loginContractor);

// Protected routes (require authentication)
router.get('/profile', authenticate, getContractorProfile);
router.put('/profile', authenticate, updateContractorProfile);
router.post('/logout', authenticate, logoutContractor);

module.exports = router;
