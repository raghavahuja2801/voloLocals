// routes/leads.js
const express = require('express');
const router  = express.Router();
const validate = require('../middleware/validateLeadData');
const controller = require('../controllers/leadController');
const authenticate = require('../middleware/authenticate');


router.use(authenticate);

// POST /api/leads → generate a new lead
router.post('/', validate, controller.generateLead);
// READ all
router.get('/', controller.listLeads);

// READ one
router.get('/:id', controller.getLead);

// UPDATE
router.patch('/:id', validate, controller.updateLead);

// DELETE
router.delete('/:id', controller.deleteLead);

module.exports = router;
