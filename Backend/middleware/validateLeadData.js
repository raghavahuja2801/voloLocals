// middleware/validateLeadData.js
module.exports = function validateLeadData(req, res, next) {
  // for now, just log incoming body
  console.log('Incoming lead payload:', req.body);
  // you might check required fields here once your schema's defined
  next();
};
