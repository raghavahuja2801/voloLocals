// controllers/leadController.js
const { faker } = require('@faker-js/faker');
const {
  createLead,
  getLeadsByUid,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadsByUidAdmin,
} = require('../models/leadModel');


// exports.createLead = async (req, res) => {
//   try {
//     const payload = { uid: req.user.uid, ...req.body };
//     const lead = await createLead(payload);
//     res.status(201).json({ success: true, lead });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: 'Failed to create lead' });
//   }
// };

exports.generateLead = async (req, res) => {
  // ignore req.body for now, spit back random lead
  

  try {
    const payload = {
      uid: req.user.uid, // from authenticate middleware
      ...req.body
        };
    const lead = await createLead(payload);
    res.status(201).json({ success: true, lead });
  }
    catch (error) {
        console.error('Error creating lead:', error);
        res.status(500);
        next(err);
    }
};

exports.listLeads = async (req, res) => {
  try {
    console.log('Fetching leads for user:', req.user);
    const leads = await getLeadsByUid(req.user.uid);
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500);
    next(err);
  }
};

exports.listAllLeads = async (req, res) => {
  try {
    const leads = await getLeadsByUidAdmin(); // Assuming this fetches all leads for admin
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500);
    next(err);
  }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await getLeadById(req.body.uid ,req.params.id);
    console.log('Fetching lead with ID:', req.params.id, 'for user:', req.user.uid);
    console.log('Lead data:', lead);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500);
    next(err);
  }
};

exports.updateLead = async (req, res) => {
  try {
    const updated = await updateLead(req.user.uid, req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Lead not found or not yours' });
    res.json({ success: true, lead: updated });
  } catch (err) {
    res.status(500);
    next(err);
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const ok = await deleteLead(req.user.uid, req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: 'Lead not found or not yours' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500);
    next(err);
  }
};