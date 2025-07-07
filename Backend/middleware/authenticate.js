const { auth } = require('../config/firebaseAdmin');

async function authenticate(req, res, next) {
  // Check for both session types
  const sessionCookie = req.cookies.session || req.cookies.contractorSession || '';
  if (!sessionCookie) {
    console.warn('No session cookie found');
    return res.status(401).json({ error: 'Not authenticated cause no cookie' });
  }

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    // Attach the same user info you were using before
    req.user = {
      uid:   decoded.uid,
      email: decoded.email,
      role:  decoded.role || 'user'
    };
    next();
  } catch (e) {
    console.error('Invalid session cookie', e);
    // Clear both possible cookies
    res.clearCookie('session');
    res.clearCookie('contractorSession');
    res.status(401).json({ error: 'Session expired' });
  }
}

module.exports = authenticate;
