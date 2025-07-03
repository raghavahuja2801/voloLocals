// middleware/authenticate.js
const {admin} = require('../config/firebaseAdmin');

async function authenticate(req, res, next) {
  const authHeader = req.header('Authorization') || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const idToken = match[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = { uid: decoded.uid, email: decoded.email };  // attach whatever you need
    next();
  } catch (err) {
    console.error('Firebase auth error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
