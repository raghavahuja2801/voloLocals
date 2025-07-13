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
  checkContractorApproved,
  getContractorCreditsBalance,
  addCreditsToContractor,
  getContractorPurchasedLeads,
  getContractorTransactions
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

// GET /api/contractor/auth/credits → Get contractor credits balance
router.get('/credits', authenticate, authenticateRoles('contractor', 'admin'), getContractorCreditsBalance);

// GET /api/contractor/auth/purchased-leads → Get contractor's purchased leads
router.get('/purchased-leads', authenticate, authenticateRoles('contractor'), getContractorPurchasedLeads);

// GET /api/contractor/auth/transactions → Get contractor's transaction history
router.get('/transactions', authenticate, authenticateRoles('contractor'), getContractorTransactions);

/**
 * ─── Admin Routes for Contractor Management ────────────────────────────────────
 */

// GET /api/contractor-auth/admin/contractors - Get all contractors (with optional status filter)
router.get('/admin/contractors', authenticate, authenticateRoles('admin'), getContractorsByStatus);

// PATCH /api/contractor-auth/admin/contractors/:contractorId/status - Update contractor status
router.patch('/admin/contractors/:contractorId/status', authenticate, authenticateRoles('admin'), updateContractorStatus);

// POST /api/contractor-auth/admin/contractors/:contractorId/credits - Add credits to contractor
router.post('/admin/contractors/:contractorId/credits', authenticate, authenticateRoles('admin'), addCreditsToContractor);

module.exports = router;
