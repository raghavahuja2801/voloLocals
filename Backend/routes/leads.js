// routes/leads.js
const express = require('express');
const router  = express.Router();
const validate = require('../middleware/validateLeadData');
const controller = require('../controllers/leadController');
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorize');
const authenticateRoles = require('../middleware/authorize');


router.use(authenticate);

// POST /api/leads → generate a new lead
router.post('/', validate, authenticateRoles('user'), controller.generateLead);
// READ all for user
router.get('/', authenticateRoles('user'), controller.listLeads);

// READ all for admin
router.get('/admin', authenticateRoles('admin'), controller.listAllLeads);

// READ one
router.get('/:id', controller.getLead);

// UPDATE
router.patch('/:id', authorizeRoles('user'), validate, controller.updateLead);

// DELETE
router.delete('/:id', authorizeRoles('user'), controller.deleteLead);

module.exports = router;
