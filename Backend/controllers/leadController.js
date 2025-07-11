// controllers/leadController.js
const { faker } = require('@faker-js/faker');
const {
  createLead,
  getLeadsByUid,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadsByUidAdmin,
  getLeadsByServiceTypes,
} = require('../models/leadModel');
const { incrementLeadsSubmitted } = require('../models/userModel');


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

exports.generateLead = async (req, res, next) => {
  try {
    const { serviceType, responses } = req.body;
    
    // Create lead payload with structured data
    const payload = {
      uid: req.user.uid, // from authenticate middleware
      serviceType,
      responses,
      // Extract common fields for easy querying
      budget: responses.budget,
      location: responses.location,
      pincode: responses.pincode,
      urgent: responses.urgent,
      contactPreference: responses['contact-preference'],
      contactTime: responses['contact-time'],
      // Status tracking
      status: 'new',
      priority: responses.urgent === 'asap' ? 'high' : responses.urgent === 'this-week' ? 'medium' : 'low'
    };
    
    const lead = await createLead(payload);
    await incrementLeadsSubmitted(req.user.uid); // Increment leads submitted count for user
    
    res.status(201).json({ 
      success: true, 
      lead,
      message: 'Lead generated successfully'
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lead'
    });
  }
};

exports.listLeads = async (req, res, next) => {
  try {
    console.log('Fetching leads for user:', req.user);
    const leads = await getLeadsByUid(req.user.uid);
    res.json({ success: true, leads });
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    });
  }
};

exports.listAllLeads = async (req, res, next) => {
  try {
    const leads = await getLeadsByUidAdmin(); // Assuming this fetches all leads for admin
    res.json({ success: true, leads });
  } catch (err) {
    console.error('Error fetching all leads:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all leads'
    });
  }
};

exports.getLead = async (req, res, next) => {
  try {
    const lead = await getLeadById(req.user.uid, req.params.id);
    console.log('Fetching lead with ID:', req.params.id, 'for user:', req.user.uid);
    console.log('Lead data:', lead);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    console.error('Error fetching lead:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lead'
    });
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const updated = await updateLead(req.user.uid, req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Lead not found or not yours' });
    res.json({ success: true, lead: updated });
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update lead'
    });
  }
};

exports.deleteLead = async (req, res, next) => {
  try {
    const ok = await deleteLead(req.user.uid, req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: 'Lead not found or not yours' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete lead'
    });
  }
};

// New function to get leads filtered by template fields
exports.getFilteredLeads = async (req, res, next) => {
  try {
    const { 
      serviceType, 
      budget, 
      urgent, 
      pincode, 
      status,
      contactPreference 
    } = req.query;

    let leads = await getLeadsByUid(req.user.uid);

    // Apply filters
    if (serviceType) {
      leads = leads.filter(lead => lead.serviceType === serviceType);
    }
    if (budget) {
      leads = leads.filter(lead => lead.budget === budget);
    }
    if (urgent) {
      leads = leads.filter(lead => lead.urgent === urgent);
    }
    if (pincode) {
      leads = leads.filter(lead => lead.pincode === pincode);
    }
    if (status) {
      leads = leads.filter(lead => lead.status === status);
    }
    if (contactPreference) {
      leads = leads.filter(lead => lead.contactPreference === contactPreference);
    }

    res.json({ 
      success: true, 
      leads,
      count: leads.length,
      filters: { serviceType, budget, urgent, pincode, status, contactPreference }
    });
  } catch (err) {
    console.error('Error filtering leads:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to filter leads'
    });
  }
};

// Function to get lead analytics
exports.getLeadAnalytics = async (req, res, next) => {
  try {
    const leads = await getLeadsByUid(req.user.uid);

    const analytics = {
      total: leads.length,
      byServiceType: {},
      byBudget: {},
      byUrgency: {},
      byStatus: {},
      byContactPreference: {},
      byPincode: {}
    };

    leads.forEach(lead => {
      // Group by service type
      analytics.byServiceType[lead.serviceType] = (analytics.byServiceType[lead.serviceType] || 0) + 1;
      
      // Group by budget
      analytics.byBudget[lead.budget] = (analytics.byBudget[lead.budget] || 0) + 1;
      
      // Group by urgency
      analytics.byUrgency[lead.urgent] = (analytics.byUrgency[lead.urgent] || 0) + 1;
      
      // Group by status
      analytics.byStatus[lead.status] = (analytics.byStatus[lead.status] || 0) + 1;
      
      // Group by contact preference
      analytics.byContactPreference[lead.contactPreference] = (analytics.byContactPreference[lead.contactPreference] || 0) + 1;
      
      // Group by pincode
      analytics.byPincode[lead.pincode] = (analytics.byPincode[lead.pincode] || 0) + 1;
    });

    res.json({ success: true, analytics });
  } catch (err) {
    console.error('Error generating lead analytics:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics'
    });
  }
};

// Function to get leads by service types for contractors
exports.getLeadsByServiceTypes = async (req, res, next) => {
  try {
    console.log('🔍 [CONTRACTOR] Getting leads by service types...');
    console.log('📥 [CONTRACTOR] Request body:', JSON.stringify(req.body, null, 2));
    
    const { serviceTypes } = req.body;
    
    // Validation
    if (!Array.isArray(serviceTypes) || serviceTypes.length === 0) {
      console.log('❌ [CONTRACTOR] Invalid serviceTypes array');
      return res.status(400).json({
        success: false,
        error: 'serviceTypes array is required and cannot be empty'
      });
    }
    
    console.log('🔍 [CONTRACTOR] Fetching leads for service types:', serviceTypes);
    const leads = await getLeadsByServiceTypes(serviceTypes);
    console.log('✅ [CONTRACTOR] Found leads:', leads.length);
    
    // Filter out sensitive user data for contractors
    const contractorLeads = leads.map(lead => ({
      id: lead.id,
      serviceType: lead.serviceType,
      budget: lead.budget,
      location: lead.location, // You might want to mask this partially later
      urgent: lead.urgent,
      status: lead.status,
      priority: lead.priority,
      createdAt: lead.createdAt,
      responses: lead.responses // Service-specific, non-personal responses
      // Explicitly exclude: uid, contactPreference, contactTime, full address details
    }));
    
    console.log('✅ [CONTRACTOR] Filtered contractor leads:', contractorLeads.length);
    
    res.json({
      success: true,
      leads: contractorLeads,
      count: contractorLeads.length,
      serviceTypes: serviceTypes
    });
  } catch (error) {
    console.error('💥 [CONTRACTOR] Error getting leads by service types:', error);
    next(error);
  }
};