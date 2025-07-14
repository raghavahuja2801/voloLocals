// routes/payments.js
const express = require('express');
const router = express.Router();
const {
  createCreditCheckoutSession,
  handleStripeWebhook
} = require('../controllers/paymentsController');
const authenticate = require('../middleware/authenticate');
const authenticateRoles = require('../middleware/authorize');
const { checkContractorApproved } = require('../controllers/contractorAuthController');

/**
 * ─── Credit Purchase Routes ────────────────────────────────────────────────────
 */

// POST /api/payments/purchase-credits → Create Stripe checkout session for credit purchase
router.post('/purchase-credits', 
  authenticate, 
  authenticateRoles('contractor'), 
  checkContractorApproved,
  createCreditCheckoutSession
);




module.exports = router;
