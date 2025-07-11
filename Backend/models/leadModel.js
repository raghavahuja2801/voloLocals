// models/leadModel.js
const { admin, db } = require('../config/firebaseAdmin');
const leadsCollection = db.collection('leads');

async function createLead(data) {
  // data should include at least { uid, ...leadFields }
  const docRef = await leadsCollection.add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: docRef.id, ...(await docRef.get()).data() };
}

async function getLeadsByUid(uid) {
  const snapshot = await leadsCollection
    .where('uid', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getLeadsByUidAdmin() {
  const snapshot = await leadsCollection
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getLeadById(uid, id) {
  const docRef = leadsCollection.doc(id);
  const snap = await docRef.get();

  if (!snap.exists || snap.data().uid !== uid) {
    console.error(`Lead with id ${id} not found or does not belong to user ${uid}`);
    return null;
  }
  return { id: snap.id, ...snap.data() };
}

async function updateLead(uid, id, updates) {
  const docRef = leadsCollection.doc(id);
  const snap = await docRef.get();

  if (!snap.exists || snap.data().uid !== uid) {
    return null;
  }
  await docRef.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const updatedSnap = await docRef.get();
  return { id: updatedSnap.id, ...updatedSnap.data() };
}

async function deleteLead(uid, id) {
  const docRef = leadsCollection.doc(id);
  const snap = await docRef.get();

  if (!snap.exists || snap.data().uid !== uid) {
    return false;
  }
  await docRef.delete();
  return true;
}

async function getLeadsByServiceTypes(serviceTypes) {
  const snapshot = await leadsCollection
    .where('serviceType', 'in', serviceTypes)
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
  createLead,
  getLeadsByUid,
  getLeadsByUidAdmin,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadsByServiceTypes
};
