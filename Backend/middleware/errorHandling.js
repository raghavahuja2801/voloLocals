// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err);  
  // If a status code was already set, use it; otherwise default to 500
  const status = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : 500;

  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
