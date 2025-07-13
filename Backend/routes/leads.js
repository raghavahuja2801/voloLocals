// routes/leads.js
const express = require('express');
const router  = express.Router();
const validate = require('../middleware/validateLeadData');
const {
  generateLead,
  listLeads,
  listAllLeads,
  getLead,
  updateLead,
  deleteLead,
  getFilteredLeads,
  getLeadAnalytics,
  getLeadsByServiceTypes,
  setLeadPrice,
  purchaseLeadByContractor,
  purchaseLeadWithCredits,
  checkLeadPurchase
} = require('../controllers/leadController');
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorize');
const authenticateRoles = require('../middleware/authorize');
const { checkContractorApproved } = require('../controllers/contractorAuthController');


router.use(authenticate);

// POST /api/leads → generate a new lead
router.post('/', validate, authenticateRoles('user', 'admin'), generateLead);

// READ all for user
router.get('/', authenticateRoles('user'), listLeads);

// READ filtered leads for user
router.get('/filter', authenticateRoles('user'), getFilteredLeads);

// GET lead analytics for user
router.get('/analytics', authenticateRoles('user'), getLeadAnalytics);

// READ all for admin
router.get('/admin', authenticateRoles('admin'), listAllLeads);

// POST /api/leads/contractor/bulk → get leads by service types for contractors
router.post('/contractor/bulk', 
  authenticateRoles('contractor', 'admin'), 
  (req, res, next) => {
    // Skip approval check for admins
    if (req.user.role === 'admin') {
      return next();
    }
    // Apply approval check for contractors
    checkContractorApproved(req, res, next);
  },
  getLeadsByServiceTypes
);

// READ one
router.get('/:id', getLead);

// UPDATE
router.patch('/:id', authorizeRoles('user'), validate, updateLead);

// DELETE
router.delete('/:id', authorizeRoles('user', 'admin'), deleteLead);

/**
 * ─── Lead Pricing & Purchase Routes ────────────────────────────────────────────
 */

// PATCH /api/leads/:leadId/price → Set price for a lead (Admin only)
router.patch('/:leadId/price', authenticateRoles('admin'), setLeadPrice);

// POST /api/leads/:leadId/purchase → Purchase a lead (Approved Contractor only)
router.post('/:leadId/purchase', 
  authenticateRoles('contractor'), 
  checkContractorApproved,
  purchaseLeadByContractor
);

// POST /api/leads/:leadId/purchase-with-credits → Purchase a lead with credits (Approved Contractor only)
router.post('/:leadId/purchase-with-credits', 
  authenticateRoles('contractor'), 
  checkContractorApproved,
  purchaseLeadWithCredits
);

// GET /api/leads/:leadId/purchase-status → Check if contractor has purchased lead
router.get('/:leadId/purchase-status', 
  authenticateRoles('contractor'), 
  checkContractorApproved,
  checkLeadPurchase
);

module.exports = router;
