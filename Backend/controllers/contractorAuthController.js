// controllers/contractorAuthController.js
const { db, auth, admin } = require('../config/firebaseAdmin');
const axios = require('axios');
const {
  createAuthUser,
  setRoleClaim,
  createProfile
} = require('../models/userModel');

exports.registerContractor = async (req, res, next) => {    
  try {
    const { 
      email, 
      password, 
      displayName, 
      phone,
      businessName,
      serviceCategories,
      serviceAreas,
      licenseNumber,
      availability
    } = req.body;

    // Required fields validation
    if (!email || !password || !displayName || !phone || !businessName) {
      res.status(400);
      throw new Error('email, password, displayName, phone, and businessName are required');
    }

    // 1) Create the Auth user
    const userRecord = await createAuthUser({
      email,
      password,
      displayName,
    });

    // 2) Set custom claim as contractor
    await setRoleClaim(userRecord.uid, 'contractor');

    // 3) Create contractor profile with new schema
    const contractorProfile = {
      email,
      displayName,
      phone,
      role: 'contractor',
      businessName,
      serviceCategories: serviceCategories || [],
      serviceAreas: serviceAreas || [],
      licenseNumber: licenseNumber || null,
      availability: availability || {
        days: [],
        hours: ''
      }
    };

    const profile = await createProfile(userRecord.uid, contractorProfile);

    // 4) Issue a custom token for client to sign-in
    const customToken = await auth.createCustomToken(userRecord.uid, { role: 'contractor' });
    
    res.status(201).json({ 
      success: true, 
      customToken, 
      profile,
      message: 'Contractor registration successful' 
    });
  } catch (err) {
    next(err);
  }
};

exports.loginContractor = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    // 1) Sign in via Firebase REST API
    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      { email, password, returnSecureToken: true }
    );

    const idToken = data.idToken;
    
    // 2) Verify the user is a contractor
    const decodedToken = await auth.verifyIdToken(idToken);
    if (decodedToken.role !== 'contractor') {
      res.status(403);
      throw new Error('Access denied. This endpoint is for contractors only.');
    }

    // 3) Create a session cookie (valid for 5 days)
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days in ms
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // 4) Set it as an HTTP-only, secure cookie
    res.cookie('contractorSession', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    // 5) Return success with contractor-specific data
    res.json({ 
      success: true,
      message: 'Contractor login successful',
      role: 'contractor'
    });
  } catch (err) {
    if (err.response?.data?.error) {
      res.status(401);
      next(new Error(err.response.data.error.message));
    } else {
      next(err);
    }
  }
};

exports.getContractorProfile = async (req, res, next) => {
  try {
    const { uid, role } = req.user; // set by authenticate middleware

    // Ensure user is a contractor
    if (role !== 'contractor') {
      res.status(403);
      throw new Error('Access denied. Contractor access required.');
    }

    // 1) Fetch the Firebase Auth user
    const userRecord = await auth.getUser(uid);

    // 2) Fetch the contractor profile
    const snap = await db.collection('contractors').doc(uid).get();
    const profile = snap.exists ? snap.data() : null;

    if (!profile) {
      res.status(404);
      throw new Error('Contractor profile not found');
    }

    // 3) Return contractor data with auth info
    res.json({
      success: true,
      contractor: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role,
        customClaims: userRecord.customClaims,
        ...profile
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.logoutContractor = (req, res) => {
  res.clearCookie('contractorSession');
  res.json({ success: true, message: 'Contractor logout successful' });
};

exports.updateContractorProfile = async (req, res, next) => {
  try {
    const { uid, role } = req.user;

    if (role !== 'contractor') {
      res.status(403);
      throw new Error('Access denied. Contractor access required.');
    }

    const {
      displayName,
      phone,
      businessName,
      serviceCategories,
      serviceAreas,
      licenseNumber,
      availability,
      address // Allow updating address structure if needed
    } = req.body;

    const updates = {};
    if (displayName !== undefined) {
      updates.name = displayName; // Map to schema field name
      updates.displayName = displayName; // Keep for backward compatibility
    }
    if (phone !== undefined) updates.phone = phone;
    if (businessName !== undefined) updates.businessName = businessName;
    if (serviceCategories !== undefined) updates.serviceCategories = serviceCategories;
    if (serviceAreas !== undefined) updates.serviceAreas = serviceAreas;
    if (licenseNumber !== undefined) updates.licenseNumber = licenseNumber;
    if (availability !== undefined) updates.availability = availability;
    if (address !== undefined) updates.address = address;

    if (Object.keys(updates).length === 0) {
      res.status(400);
      throw new Error('No valid fields to update');
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    updates.lastLogin = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('contractors').doc(uid).update(updates);

    const updatedDoc = await db.collection('contractors').doc(uid).get();
    const updatedProfile = updatedDoc.data();

    res.json({
      success: true,
      message: 'Contractor profile updated successfully',
      profile: updatedProfile
    });
  } catch (err) {
    next(err);
  }
};
