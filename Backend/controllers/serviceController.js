// controllers/serviceController.js
const { createServiceDoc,
  updateServiceDoc, 
  deleteServiceDoc, 
  getQuestionsFor,
  listServices 
} = require('../models/serviceModel');



// Helper function to get template fields that should be added to every service
function getTemplateFields() {
  return [
    {
      id: 'budget',
      type: 'select',
      label: 'What is your budget range?',
      required: true,
      options: [
        { value: 'under-1000', label: 'Under $1,000' },
        { value: '1000-5000', label: '$1,000 - $5,000' },
        { value: '5000-10000', label: '$5,000 - $10,000' },
        { value: '10000-25000', label: '$10,000 - $25,000' },
        { value: 'above-25000', label: 'Above $25,000' }
      ]
    },
    {
      id: 'location',
      type: 'text',
      label: 'Service location address',
      required: true,
      placeholder: 'Enter the address where service is needed'
    },
    {
      id: 'pincode',
      type: 'text',
      label: 'PIN/ZIP Code',
      required: true,
      placeholder: 'Enter your PIN/ZIP code',
      pattern: '^[0-9]{5,6}$'
    },
    {
      id: 'urgent',
      type: 'select',
      label: 'How urgent is this service?',
      required: true,
      options: [
        { value: 'asap', label: 'ASAP (Within 24 hours)' },
        { value: 'this-week', label: 'This week' },
        { value: 'next-week', label: 'Next week' },
        { value: 'flexible', label: 'Flexible timing' }
      ]
    },
    {
      id: 'contact-preference',
      type: 'select',
      label: 'Preferred contact method',
      required: true,
      options: [
        { value: 'phone', label: 'Phone call' },
        { value: 'email', label: 'Email' },
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'any', label: 'Any method' }
      ]
    },
    {
      id: 'contact-time',
      type: 'select',
      label: 'Best time to contact you',
      required: false,
      options: [
        { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
        { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
        { value: 'evening', label: 'Evening (6 PM - 9 PM)' },
        { value: 'anytime', label: 'Anytime' }
      ]
    }
  ];
}

exports.createService = async (req, res, next) => {
  try {
    const { serviceType, questions } = req.body;
    if (!serviceType || !Array.isArray(questions)) {
      res.status(400);
      throw new Error('serviceType and questions array required');
    }
    
    // Get template fields
    const templateFields = getTemplateFields();
    
    // Combine template fields with admin-provided questions
    const combinedQuestions = [...templateFields, ...questions];
    
    await createServiceDoc(serviceType, combinedQuestions);
    res.status(201).json({ 
      success: true, 
      message: `Service "${serviceType}" created with ${templateFields.length} template fields and ${questions.length} custom questions` 
    });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const { serviceType } = req.params;
    const { questions } = req.body;
    if (!Array.isArray(questions)) {
      res.status(400);
      throw new Error('questions array required');
    }
    
    // Get template fields and combine with updated questions
    const templateFields = getTemplateFields();
    const combinedQuestions = [...templateFields, ...questions];
    
    await updateServiceDoc(serviceType, combinedQuestions);
    res.json({ 
      success: true, 
      message: `Service "${serviceType}" updated with ${templateFields.length} template fields and ${questions.length} custom questions` 
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const { serviceType } = req.params;
    await deleteServiceDoc(serviceType);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};


exports.listQuestions = async (req, res, next) => {
  const { serviceType } = req.params;
  const questions = await getQuestionsFor(serviceType);
  console.log(`Fetching questions for service type: ${serviceType}`);

  if (!questions) {
    return res.status(404).json({
      success: false,
      message: `No questions found for service type “${serviceType}”`
    });
  }
  res.json({ success: true, serviceType, questions });
};

exports.listServices = async (req, res, next) => {
  try {
    const services = await listServices();
    res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
};
