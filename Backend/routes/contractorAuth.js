// routes/contractorAuth.js
const express = require('express');
const router = express.Router();
const {
  registerContractor,
  loginContractor,
  getContractorProfile,
  logoutContractor,
  updateContractorProfile,
  updateContractorStatus,
  getContractorsByStatus,
  checkContractorApproved
} = require('../controllers/contractorAuthController');
const authenticate = require('../middleware/authenticate');
const authenticateRoles = require('../middleware/authorize');

// Public routes
router.post('/register', registerContractor);
router.post('/login', loginContractor);

// Protected routes (require authentication)
router.get('/profile', authenticate, getContractorProfile);
router.put('/profile', authenticate, updateContractorProfile);
router.post('/logout', authenticate, logoutContractor);

/**
 * ─── Admin Routes for Contractor Management ────────────────────────────────────
 */

// GET /api/contractor-auth/admin/contractors - Get all contractors (with optional status filter)
router.get('/admin/contractors', authenticate, authenticateRoles('admin'), getContractorsByStatus);

// PATCH /api/contractor-auth/admin/contractors/:contractorId/status - Update contractor status
router.patch('/admin/contractors/:contractorId/status', authenticate, authenticateRoles('admin'), updateContractorStatus);

module.exports = router;
