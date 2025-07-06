// controllers/serviceController.js
const { createServiceDoc,
  updateServiceDoc, 
  deleteServiceDoc, 
  getQuestionsFor,
  listServices 
} = require('../models/serviceModel');



exports.createService = async (req, res, next) => {
  try {
    const { serviceType, questions } = req.body;
    if (!serviceType || !Array.isArray(questions)) {
      res.status(400);
      throw new Error('serviceType and questions array required');
    }
    await createServiceDoc(serviceType, questions);
    res.status(201).json({ success: true });
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
    await updateServiceDoc(serviceType, questions);
    res.json({ success: true });
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
