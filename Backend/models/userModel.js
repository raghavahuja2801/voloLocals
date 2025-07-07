// models/userModel.js
const { auth, db, admin, FieldValue } = require('../config/firebaseAdmin');
const USERS_COL    = 'users';
const CONTRACTORS_COL = 'contractors';

async function createAuthUser({ email, password, displayName }) {
  return auth.createUser({ email, password, displayName });
}

async function setRoleClaim(uid, role) {
  return auth.setCustomUserClaims(uid, { role });
}

async function createProfile(uid, profileData) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  console.log(`Creating profile at ${now} for UID: ${uid}, Role: ${profileData.role}`);
  
  // Base profile structure for both users and contractors
  const baseProfile = {
    uid,
    role: profileData.role,
    name: profileData.displayName, // Map displayName to name in schema
    email: profileData.email,
    phone: profileData.phone,
    createdAt: now,
    updatedAt: now
  };

  let payload;

  if (profileData.role === 'contractor') {
    // Contractor-specific schema
    payload = {
      ...baseProfile,
      businessName: profileData.businessName,
      serviceCategories: profileData.serviceCategories || [],
      serviceAreas: profileData.serviceAreas || [],
      licenseNumber: profileData.licenseNumber || null,
      rating: 'N/A',
      jobsCompleted: 0,
      credits: 0,
      availability: profileData.availability || {
        days: [],
        hours: ''
      },
      purchasedLeads: [],
      lastLogin: now
    };
  } else {
    // User-specific schema
    payload = {
      ...baseProfile,
      address: profileData.address || {
        street: '',
        city: '',
        province: '',
        postalCode: ''
      },
      leadsSubmitted: 0,
      lastActive: now
    };
  }

  const col = profileData.role === 'contractor' ? CONTRACTORS_COL : USERS_COL;
  await db.collection(col).doc(uid).set(payload);
  return payload;
}

async function getProfile(uid, role) {
  const col = role === 'contractor' ? CONTRACTORS_COL : USERS_COL;
  const snap = await db.collection(col).doc(uid).get();
  return snap.exists ? snap.data() : null;
}

async function updateProfile(uid, role, updates) {
  const col = role === 'contractor' ? CONTRACTORS_COL : USERS_COL;
  const docRef = db.collection(col).doc(uid);
  
  // Ensure we always update the updatedAt timestamp
  const updatePayload = {
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  };
  
  // For contractors, update lastLogin if not already in updates
  if (role === 'contractor' && !updates.lastLogin) {
    updatePayload.lastLogin = FieldValue.serverTimestamp();
  }
  
  // For users, update lastActive if not already in updates
  if (role === 'user' && !updates.lastActive) {
    updatePayload.lastActive = FieldValue.serverTimestamp();
  }
  
  await docRef.update(updatePayload);
  const snap = await docRef.get();
  return snap.data();
}

async function deleteProfile(uid, role) {
  const col = role === 'contractor' ? CONTRACTORS_COL : USERS_COL;
  await db.collection(col).doc(uid).delete();
  return true;
}

// Helper functions for specific operations
async function incrementLeadsSubmitted(uid) {
  const docRef = db.collection(USERS_COL).doc(uid);
  await docRef.update({
    leadsSubmitted: FieldValue.increment(1),
    lastActive: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });
}

async function incrementJobsCompleted(uid) {
  const docRef = db.collection(CONTRACTORS_COL).doc(uid);
  await docRef.update({
    jobsCompleted: FieldValue.increment(1),
    lastLogin: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });
}

async function updateContractorCredits(uid, creditChange) {
  const docRef = db.collection(CONTRACTORS_COL).doc(uid);
  await docRef.update({
    credits: FieldValue.increment(creditChange),
    lastLogin: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });
}

async function updateContractorRating(uid, newRating) {
  const docRef = db.collection(CONTRACTORS_COL).doc(uid);
  await docRef.update({
    rating: newRating,
    lastLogin: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });
}

async function addPurchasedLead(uid, leadId) {
  const docRef = db.collection(CONTRACTORS_COL).doc(uid);
  await docRef.update({
    purchasedLeads: FieldValue.arrayUnion(leadId),
    lastLogin: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });
}

module.exports = {
  createAuthUser,
  setRoleClaim,
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  incrementLeadsSubmitted,
  incrementJobsCompleted,
  updateContractorCredits,
  updateContractorRating,
  addPurchasedLead,
};
