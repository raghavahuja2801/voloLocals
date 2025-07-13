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

/**
 * ─── Webhook Routes ─────────────────────────────────────────────────────────────
 */

// POST /api/payments/stripe-webhook → Handle Stripe webhook events
// Note: This route should NOT use authentication middleware as it's called by Stripe
router.post('/stripe-webhook', 
  express.raw({ type: 'application/json' }), // Stripe requires raw body
  handleStripeWebhook
);

module.exports = router;
