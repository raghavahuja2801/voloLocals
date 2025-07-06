// routes/services.js
const express = require('express');
const router  = express.Router();
const authenticate      = require('../middleware/authenticate');
const authenticateRoles  = require('../middleware/authorize');
const {
  listQuestions,
  createService,
  updateService,
  deleteService,
  listServices
} = require('../controllers/serviceController');

/**
 * ─── Public Endpoint ────────────────────────────────────────────────────────────
 */

// GET    /api/services/:serviceType/questions
// Fetch the questions for a given serviceType.
router.get('/:serviceType/questions', listQuestions);
router.get('/', listServices);

// all routes require a valid Firebase token
router.use(authenticate);

/**
 * ─── Admin Endpoints ────────────────────────────────────────────────────────────
 */

// POST   /api/services
// Create a new serviceQuestions document.
// Expects { serviceType: string, questions: array } in the JSON body.
router.post('/', authenticateRoles('admin'), createService);

// PUT    /api/services/:serviceType
// Overwrite the questions array for an existing serviceType doc.
// Expects { questions: array } in the JSON body.
router.put('/:serviceType',authenticateRoles('admin'), updateService);

// DELETE /api/services/:serviceType
// Delete the entire serviceType doc.
router.delete('/:serviceType',authenticateRoles('admin'), deleteService);


module.exports = router;
