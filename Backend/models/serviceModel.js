// models/serviceModel.js
const { db } = require('../config/firebaseAdmin');
const serviceCol = db.collection('serviceQuestions');

async function getQuestionsFor(serviceType) {
  const snap = await serviceCol.doc(serviceType).get();
  if (!snap.exists) return null;
  return snap.data().questions;
}

function createServiceDoc(serviceType, questions) {
  return serviceCol.doc(serviceType).set({ questions });
}

function updateServiceDoc(serviceType, questions) {
  // set() without merge will overwrite
  return serviceCol.doc(serviceType).set({ questions });
}

function deleteServiceDoc(serviceType) {
  return serviceCol.doc(serviceType).delete();
}

function listServices() {
  return serviceCol.get().then(snapshot => {
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => doc.id);
  });
}

module.exports = {
  createServiceDoc,
  updateServiceDoc,
  deleteServiceDoc,
  getQuestionsFor, // your existing reader
  listServices
};

