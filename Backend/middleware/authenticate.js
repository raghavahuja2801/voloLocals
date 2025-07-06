const { auth } = require('../config/firebaseAdmin');

async function authenticate(req, res, next) {
  const sessionCookie = req.cookies.session || '';
  if (!sessionCookie) {
    console.warn('No session cookie found');
    return res.status(401).json({ error: 'Not authenticated' });
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
    res.clearCookie('session');
    res.status(401).json({ error: 'Session expired' });
  }
}

module.exports = authenticate;
