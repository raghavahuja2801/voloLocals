// controllers/authController.js
const {  db, auth, admin } = require('../config/firebaseAdmin');
const axios = require('axios');
const ALLOWED_ROLES = ['user', 'contractor'];
const {
  createAuthUser,
  setRoleClaim,
  createProfile
} = require('../models/userModel');


exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName, role } = req.body;
    if (!email || !password || !displayName || !role) {
      res.status(400);
      throw new Error('email, password, displayName and role are required');
    }
    if (!ALLOWED_ROLES.includes(role)) {
      res.status(400);
      throw new Error(`role must be one of ${ALLOWED_ROLES.join(', ')}`);
    }

    // 1) Create the Auth user
    const userRecord = await createAuthUser({
      email,
      password,
      displayName,
    });

    // 2) Set custom claim
    await setRoleClaim(userRecord.uid, role);

    // 3) Firestore profile write
    const profile = await createProfile(userRecord.uid, {
      email,
      displayName,
      role
    });

    // 4) Issue a custom token for client to sign-in
    const customToken = await auth.createCustomToken(userRecord.uid, { role });
    res.status(201).json({ success: true,customToken, profile });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 1) Sign in via Firebase REST:
    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      { email, password, returnSecureToken: true }
    );

    const idToken = data.idToken;
    // 2) Create a session cookie (valid for 5 days, for example)
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days in ms
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // 3) Set it as an HTTP-only, secure cookie
    res.cookie('session', sessionCookie, {
      maxAge:   expiresIn,
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path:     '/'
    });

    // 4) Return success (no token in body)
    res.json({ success: true });
  } catch (err) {
    if (err.response?.data?.error) {
      res.status(401);
      next(new Error(err.response.data.error.message));
    } else {
      next(err);
    }
  }
};


/**
 * GET /api/auth/me
 * Headers: Authorization: Bearer <idToken>
 * Returns the Auth user record plus your Firestore profile.
 */
exports.getProfile = async (req, res, next) => {
  try {
    const { uid, role } = req.user;           // set by your authenticate middleware

    // 1) fetch the Firebase Auth user
    const userRecord = await auth.getUser(uid);

    // 2) pick the right collection based on role
    const colName = role === 'contractor'
      ? 'contractors'
      : role === 'admin'
        ? 'admins'
        : 'users';

    // 3) fetch the profile doc
    const snap = await db.collection(colName).doc(uid).get();
    const profile = snap.exists ? snap.data() : null;

    // 4) respond with merged data
    res.json({
      success: true,
      user: {
        uid:            userRecord.uid,
        email:          userRecord.email,
        displayName:    userRecord.displayName,
        role,
        customClaims:   userRecord.customClaims,
        // then your profile fields:
        ...profile
      }
    });
  } catch (err) {
    next(err);
  }
};

// controllers/authController.js
exports.logout = (req, res) => {
  res.clearCookie('session');
  res.json({ success: true });
};
