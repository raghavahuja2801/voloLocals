// models/leadModel.js
const { admin, db } = require('../config/firebaseAdmin');
const leadsCollection = db.collection('leads');

async function createLead(data) {
  // data should include at least { uid, ...leadFields }
  const docRef = await leadsCollection.add({
    ...data,
    // Pricing fields
    price: 0, // Base price starts at 0
    purchaseCount: 0, // Number of contractors who bought this lead
    purchasedBy: [], // Array of contractor UIDs who purchased this lead
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

/**
 * Set price for a lead (Admin only)
 */
async function setLeadPrice(leadId, price) {
  try {
    const docRef = leadsCollection.doc(leadId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Lead not found');
    }

    await docRef.update({
      price: price,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedSnap = await docRef.get();
    return { id: updatedSnap.id, ...updatedSnap.data() };
  } catch (error) {
    console.error('Error setting lead price:', error);
    throw error;
  }
}



/**
 * Purchase a lead with credits (Contractor only)
 */
async function purchaseLeadWithCredits(leadId, contractorUid) {
  try {
    const { getContractorCredits, deductContractorCredits, addPurchasedLead } = require('./contractorModel');
    
    const docRef = leadsCollection.doc(leadId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Lead not found');
    }

    const leadData = snap.data();

    // Check if contractor has already purchased this lead
    if (leadData.purchasedBy && leadData.purchasedBy.includes(contractorUid)) {
      throw new Error('Lead already purchased by this contractor');
    }

    // Check if lead has a price set
    if (!leadData.price || leadData.price <= 0) {
      throw new Error('Lead price not set or invalid');
    }

    // Check contractor credits
    const contractorCredits = await getContractorCredits(contractorUid);
    if (contractorCredits < leadData.price) {
      throw new Error(`Insufficient credits. Required: ${leadData.price}, Available: ${contractorCredits}`);
    }

    // Deduct credits from contractor account with transaction details
    const transactionDetails = {
      description: `Purchased lead: ${leadData.serviceType || 'Service'} - ${leadData.price} credits`,
      leadId: leadId,
      metadata: {
        serviceType: leadData.serviceType,
        location: leadData.location,
        urgent: leadData.urgent
      }
    };
    await deductContractorCredits(contractorUid, leadData.price, transactionDetails);

    // Update lead with new purchase
    await docRef.update({
      purchaseCount: admin.firestore.FieldValue.increment(1),
      purchasedBy: admin.firestore.FieldValue.arrayUnion(contractorUid),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add lead to contractor's purchased leads array
    await addPurchasedLead(contractorUid, leadId);

    const updatedSnap = await docRef.get();
    return { id: updatedSnap.id, ...updatedSnap.data() };
  } catch (error) {
    console.error('Error purchasing lead with credits:', error);
    throw error;
  }
}

/**
 * Purchase a lead (basic version without credit validation)
 */
async function purchaseLead(leadId, contractorUid) {
  try {
    const { addPurchasedLead, addContractorTransaction } = require('./contractorModel');
    
    const docRef = leadsCollection.doc(leadId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Lead not found');
    }

    const leadData = snap.data();

    // Check if contractor has already purchased this lead
    if (leadData.purchasedBy && leadData.purchasedBy.includes(contractorUid)) {
      throw new Error('Lead already purchased by this contractor');
    }

    // Update lead with new purchase
    await docRef.update({
      purchaseCount: admin.firestore.FieldValue.increment(1),
      purchasedBy: admin.firestore.FieldValue.arrayUnion(contractorUid),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add lead to contractor's purchased leads array
    await addPurchasedLead(contractorUid, leadId);

    // Add transaction record for free lead purchase
    const transactionData = {
      type: 'lead_purchase',
      amount: 0, // Free purchase
      description: `Free lead purchase: ${leadData.serviceType || 'Service'}`,
      leadId: leadId,
      timestamp: new Date(), // Use regular Date instead of serverTimestamp
      metadata: {
        serviceType: leadData.serviceType,
        location: leadData.location,
        urgent: leadData.urgent,
        purchaseType: 'free'
      }
    };
    await addContractorTransaction(contractorUid, transactionData);

    const updatedSnap = await docRef.get();
    return { id: updatedSnap.id, ...updatedSnap.data() };
  } catch (error) {
    console.error('Error purchasing lead:', error);
    throw error;
  }
}

/**
 * Check if contractor has purchased a specific lead
 */
async function hasContractorPurchasedLead(leadId, contractorUid) {
  try {
    const docRef = leadsCollection.doc(leadId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return false;
    }

    const leadData = snap.data();
    return leadData.purchasedBy && leadData.purchasedBy.includes(contractorUid);
  } catch (error) {
    console.error('Error checking lead purchase:', error);
    throw error;
  }
}

module.exports = {
  createLead,
  getLeadsByUid,
  getLeadsByUidAdmin,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadsByServiceTypes,
  setLeadPrice,
  purchaseLeadWithCredits,
  purchaseLead,
  hasContractorPurchasedLead
};
