// middleware/authorize.js
module.exports = function authorizeRoles(...allowed) {
  return (req, res, next) => {
    console.log('authorizeRoles middleware initialized with roles:', allowed, "Role :", req.user.role);
    if (!req.user || !allowed.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: insufficient role' });
    }
    next();
  };
};
