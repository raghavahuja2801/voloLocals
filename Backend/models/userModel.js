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

async function createProfile(uid, { email, displayName, role }) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  console.log(`Creating profile at ${now} for UID: ${uid}, Role: ${role}`);
  const payload = { uid, email, displayName, role, createdAt: now };

  const col = role === 'contractor' ? CONTRACTORS_COL : USERS_COL;
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
  await docRef.update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });
  const snap = await docRef.get();
  return snap.data();
}

async function deleteProfile(uid, role) {
  const col = role === 'contractor' ? CONTRACTORS_COL : USERS_COL;
  await db.collection(col).doc(uid).delete();
  return true;
}

module.exports = {
  createAuthUser,
  setRoleClaim,
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
};
