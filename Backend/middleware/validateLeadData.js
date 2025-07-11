// middleware/validateLeadData.js
const { getQuestionsFor } = require('../models/serviceModel');

// Template field validation rules
const templateFieldValidators = {
  budget: {
    required: true,
    type: 'string',
    allowedValues: ['under-1000', '1000-5000', '5000-10000', '10000-25000', 'above-25000']
  },
  location: {
    required: true,
    type: 'string',
    minLength: 5
  },
  urgent: {
    required: true,
    type: 'string',
    allowedValues: ['asap', 'this-week', 'next-week', 'flexible']
  },
  'contact-preference': {
    required: true,
    type: 'string',
    allowedValues: ['phone', 'email', 'whatsapp', 'any']
  },
  'contact-time': {
    required: false,
    type: 'string',
    allowedValues: ['morning', 'afternoon', 'evening', 'anytime']
  }
};

function validateField(fieldId, value, validator) {
  console.log(`  🔍 [FIELD-VALIDATION] Validating field: ${fieldId}`);
  console.log(`  🔍 [FIELD-VALIDATION] Value: ${JSON.stringify(value)} (type: ${typeof value})`);
  console.log(`  🔍 [FIELD-VALIDATION] Validator rules:`, validator);
  
  const errors = [];

  // Check if required field is missing
  if (validator.required && (value === undefined || value === null || value === '')) {
    console.log(`  ❌ [FIELD-VALIDATION] ${fieldId} is required but missing/empty`);
    errors.push(`${fieldId} is required`);
    return errors;
  }

  // If field is not required and empty, skip other validations
  if (!validator.required && (value === undefined || value === null || value === '')) {
    console.log(`  ✅ [FIELD-VALIDATION] ${fieldId} is optional and empty - skipping other validations`);
    return errors;
  }

  // Type validation
  if (validator.type === 'string' && typeof value !== 'string') {
    console.log(`  ❌ [FIELD-VALIDATION] ${fieldId} type validation failed - expected string, got ${typeof value}`);
    errors.push(`${fieldId} must be a string`);
  }

  // Pattern validation
  if (validator.pattern && !validator.pattern.test(value)) {
    console.log(`  ❌ [FIELD-VALIDATION] ${fieldId} pattern validation failed - pattern: ${validator.pattern}, value: ${value}`);
    errors.push(`${fieldId} format is invalid`);
  }

  // Min length validation
  if (validator.minLength && value.length < validator.minLength) {
    console.log(`  ❌ [FIELD-VALIDATION] ${fieldId} min length validation failed - min: ${validator.minLength}, actual: ${value.length}`);
    errors.push(`${fieldId} must be at least ${validator.minLength} characters long`);
  }

  // Allowed values validation
  if (validator.allowedValues && !validator.allowedValues.includes(value)) {
    console.log(`  ❌ [FIELD-VALIDATION] ${fieldId} allowed values validation failed - allowed: [${validator.allowedValues.join(', ')}], got: ${value}`);
    errors.push(`${fieldId} must be one of: ${validator.allowedValues.join(', ')}`);
  }

  if (errors.length === 0) {
    console.log(`  ✅ [FIELD-VALIDATION] ${fieldId} passed all validations`);
  }

  return errors;
}

module.exports = async function validateLeadData(req, res, next) {
  console.log('🔍 [VALIDATION] Starting lead validation...');
  console.log('📥 [VALIDATION] Request body received:', JSON.stringify(req.body, null, 2));
  console.log('📥 [VALIDATION] Request headers:', req.headers['content-type']);
  
  try {    
    const { serviceType, responses } = req.body;
    const errors = [];

    console.log('🔍 [VALIDATION] Extracted serviceType:', serviceType);
    console.log('🔍 [VALIDATION] Extracted responses:', JSON.stringify(responses, null, 2));

    // Validate serviceType is provided
    if (!serviceType) {
      console.log('❌ [VALIDATION] serviceType is missing');
      return res.status(400).json({
        success: false,
        error: 'serviceType is required'
      });
    }
    console.log('✅ [VALIDATION] serviceType validation passed');

    // Validate responses object is provided
    if (!responses || typeof responses !== 'object') {
      console.log('❌ [VALIDATION] responses object is invalid:', typeof responses, responses);
      return res.status(400).json({
        success: false,
        error: 'responses object is required'
      });
    }
    console.log('✅ [VALIDATION] responses object validation passed');

    // Get service questions to validate against
    console.log('🔍 [VALIDATION] Fetching service questions for serviceType:', serviceType);
    const serviceQuestions = await getQuestionsFor(serviceType);
    if (!serviceQuestions) {
      console.log('❌ [VALIDATION] Service type not found:', serviceType);
      return res.status(400).json({
        success: false,
        error: `Service type "${serviceType}" not found`
      });
    }
    console.log('✅ [VALIDATION] Found service questions:', serviceQuestions.length, 'questions');
    console.log('🔍 [VALIDATION] Service questions structure:', JSON.stringify(serviceQuestions, null, 2));

    // Validate template fields
    console.log('🔍 [VALIDATION] Starting template fields validation...');
    for (const [fieldId, validator] of Object.entries(templateFieldValidators)) {
      console.log(`🔍 [VALIDATION] Validating template field: ${fieldId}`);
      console.log(`🔍 [VALIDATION] Field value:`, responses[fieldId]);
      console.log(`🔍 [VALIDATION] Field validator:`, validator);
      
      const fieldErrors = validateField(fieldId, responses[fieldId], validator);
      if (fieldErrors.length > 0) {
        console.log(`❌ [VALIDATION] Template field ${fieldId} failed:`, fieldErrors);
      } else {
        console.log(`✅ [VALIDATION] Template field ${fieldId} passed`);
      }
      errors.push(...fieldErrors);
    }

    // Validate service-specific questions
    console.log('🔍 [VALIDATION] Starting service-specific questions validation...');
    const customQuestions = serviceQuestions.filter(q => !templateFieldValidators[q.id]);
    console.log('🔍 [VALIDATION] Found custom questions:', customQuestions.length);
    console.log('🔍 [VALIDATION] Custom questions:', JSON.stringify(customQuestions.map(q => ({id: q.id, required: q.required})), null, 2));
    
    for (const question of customQuestions) {
      console.log(`🔍 [VALIDATION] Validating custom question: ${question.id} (required: ${question.required})`);
      console.log(`🔍 [VALIDATION] Question value:`, responses[question.id]);
      
      if (question.required && (responses[question.id] === undefined || responses[question.id] === null || responses[question.id] === '')) {
        console.log(`❌ [VALIDATION] Custom question ${question.id} is required but missing`);
        errors.push(`${question.id} is required`);
      } else {
        console.log(`✅ [VALIDATION] Custom question ${question.id} passed`);
      }
    }

    console.log('🔍 [VALIDATION] Total validation errors found:', errors.length);
    if (errors.length > 0) {
      console.log('❌ [VALIDATION] Validation failed with errors:', errors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    console.log('✅ [VALIDATION] All validation checks passed! Proceeding to next middleware...');
    next();
  } catch (err) {
    console.error('💥 [VALIDATION] Error in validateLeadData middleware:', err);
    console.error('💥 [VALIDATION] Error stack:', err.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error during validation'
    });
  }
};
