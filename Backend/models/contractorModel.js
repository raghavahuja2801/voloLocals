// models/contractorModel.js
const { db, admin } = require('../config/firebaseAdmin');
const contractorsCollection = db.collection('contractors');

/**
 * Create a new contractor profile
 */
async function createContractor(uid, contractorData) {
  try {
    // Filter out undefined values and provide defaults
    const cleanedData = {};
    
    // Required fields with validation
    if (!contractorData.email) throw new Error('Email is required');
    if (!contractorData.displayName) throw new Error('Display name is required');
    if (!contractorData.phone) throw new Error('Phone is required');
    if (!contractorData.businessName) throw new Error('Business name is required');
    
    // Add required fields
    cleanedData.email = contractorData.email;
    cleanedData.displayName = contractorData.displayName;
    cleanedData.phone = contractorData.phone;
    cleanedData.businessName = contractorData.businessName;
    cleanedData.role = contractorData.role || 'contractor';
    
    // Add optional fields with defaults
    cleanedData.serviceCategories = contractorData.serviceCategories || [];
    cleanedData.serviceAreas = contractorData.serviceAreas || [];
    cleanedData.licenseNumber = contractorData.licenseNumber || null;
    cleanedData.availability = contractorData.availability || {
      days: [],
      hours: ''
    };
    cleanedData.credits = 0; // Default credits balance
    cleanedData.purchasedLeads = []; // Array of purchased lead IDs
    cleanedData.transactions = []; // Array of transaction records
    cleanedData.status = 'pending'; // Default status - pending approval
    cleanedData.approvedAt = null;  // Track when contractor was approved
    cleanedData.approvedBy = null;  // Track which admin approved the contractor
    cleanedData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    cleanedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await contractorsCollection.doc(uid).set(cleanedData);
    
    // Fetch the document back to get the actual stored data with resolved timestamps
    const savedDoc = await contractorsCollection.doc(uid).get();
    const savedData = savedDoc.data();
    
    return { id: uid, ...savedData };
  } catch (error) {
    console.error('❌ [CONTRACTOR-MODEL] Error creating contractor:', error);
    throw error;
  }
}

/**
 * Get contractor by UID
 */
async function getContractorByUid(uid) {
  try {
    const doc = await contractorsCollection.doc(uid).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error fetching contractor:', error);
    throw error;
  }
}

/**
 * Update contractor profile
 */
async function updateContractor(uid, updateData) {
  try {
    // Filter out undefined values
    const cleanedUpdates = {};
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        cleanedUpdates[key] = updateData[key];
      }
    });
    
    const updates = {
      ...cleanedUpdates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await contractorsCollection.doc(uid).update(updates);
    
    const updatedDoc = await contractorsCollection.doc(uid).get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error('❌ [CONTRACTOR-MODEL] Error updating contractor:', error);
    throw error;
  }
}

/**
 * Update contractor status (admin function)
 */
async function updateContractorStatus(contractorId, status, adminUid = null) {
  try {
    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // If approving, add approval metadata
    if (status === 'approved') {
      updateData.approvedAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.approvedBy = adminUid;
    }
    
    await contractorsCollection.doc(contractorId).update(updateData);
    
    // Get updated contractor data
    const doc = await contractorsCollection.doc(contractorId).get();
    if (!doc.exists) {
      throw new Error('Contractor not found');
    }
    
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error updating contractor status:', error);
    throw error;
  }
}

/**
 * Get contractors by status (for admin dashboard)
 */
async function getContractorsByStatus(status = null) {
  try {
    let query = contractorsCollection.orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching contractors by status:', error);
    throw error;
  }
}

/**
 * Delete contractor profile
 */
async function deleteContractor(uid) {
  try {
    await contractorsCollection.doc(uid).delete();
    return true;
  } catch (error) {
    console.error('Error deleting contractor:', error);
    throw error;
  }
}

/**
 * Check if contractor exists
 */
async function contractorExists(uid) {
  try {
    const doc = await contractorsCollection.doc(uid).get();
    return doc.exists;
  } catch (error) {
    console.error('Error checking contractor existence:', error);
    throw error;
  }
}

/**
 * Get contractors by service categories
 */
async function getContractorsByServices(serviceCategories) {
  try {
    const snapshot = await contractorsCollection
      .where('status', '==', 'approved')
      .where('serviceCategories', 'array-contains-any', serviceCategories)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching contractors by services:', error);
    throw error;
  }
}

/**
 * Migration function - Update existing contractors without status
 */
async function migrateContractorsStatus() {
  try {
    // Get all contractors
    const snapshot = await contractorsCollection.get();
    const batch = db.batch();
    let updatedCount = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Check if contractor doesn't have status field
      if (!data.status) {
        batch.update(doc.ref, {
          status: 'pending',
          approvedAt: null,
          approvedBy: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
    }
    
    return updatedCount;
  } catch (error) {
    console.error('Error migrating contractor status:', error);
    throw error;
  }
}

/**
 * Get contractor credits balance
 */
async function getContractorCredits(uid) {
  try {
    const doc = await contractorsCollection.doc(uid).get();
    if (!doc.exists) {
      throw new Error('Contractor not found');
    }
    return doc.data().credits || 0;
  } catch (error) {
    console.error('Error fetching contractor credits:', error);
    throw error;
  }
}

/**
 * Deduct credits from contractor account with transaction tracking
 */
async function deductContractorCredits(uid, amount, transactionDetails = {}) {
  try {
    const doc = await contractorsCollection.doc(uid).get();
    if (!doc.exists) {
      throw new Error('Contractor not found');
    }

    const currentCredits = doc.data().credits || 0;
    if (currentCredits < amount) {
      throw new Error('Insufficient credits');
    }

    // Create transaction record
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'lead_purchase',
      amount: -amount, // Negative for deduction
      description: transactionDetails.description || `Lead purchase - ${amount} credits`,
      leadId: transactionDetails.leadId || null,
      timestamp: new Date(), // Use regular Date instead of serverTimestamp
      status: 'completed',
      metadata: transactionDetails.metadata || {}
    };

    await contractorsCollection.doc(uid).update({
      credits: admin.firestore.FieldValue.increment(-amount),
      transactions: admin.firestore.FieldValue.arrayUnion(transaction),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Return updated contractor data
    const updatedDoc = await contractorsCollection.doc(uid).get();
    return { 
      id: updatedDoc.id, 
      ...updatedDoc.data(),
      transactionId: transaction.id
    };
  } catch (error) {
    console.error('Error deducting contractor credits:', error);
    throw error;
  }
}

/**
 * Add credits to contractor account with transaction tracking
 */
async function addContractorCredits(uid, amount, adminUid = null) {
  try {
    const doc = await contractorsCollection.doc(uid).get();
    if (!doc.exists) {
      throw new Error('Contractor not found');
    }

    // Create transaction record
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'credit_addition',
      amount: amount, // Positive for addition
      description: `Credits added by admin - ${amount} credits`,
      timestamp: new Date(), // Use regular Date instead of serverTimestamp
      status: 'completed',
      metadata: {
        adminId: adminUid
      }
    };

    await contractorsCollection.doc(uid).update({
      credits: admin.firestore.FieldValue.increment(amount),
      transactions: admin.firestore.FieldValue.arrayUnion(transaction),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Return updated contractor data
    const updatedDoc = await contractorsCollection.doc(uid).get();
    return { 
      id: updatedDoc.id, 
      ...updatedDoc.data(),
      transactionId: transaction.id
    };
  } catch (error) {
    console.error('Error adding contractor credits:', error);
    throw error;
  }
}

/**
 * Add a purchased lead to contractor's purchase history
 */
async function addPurchasedLead(contractorUid, leadId) {
  try {
    const docRef = contractorsCollection.doc(contractorUid);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Contractor not found');
    }

    // Add lead ID to purchasedLeads array
    await docRef.update({
      purchasedLeads: admin.firestore.FieldValue.arrayUnion(leadId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error adding purchased lead to contractor:', error);
    throw error;
  }
}

/**
 * Get contractor's purchased leads
 */
async function getContractorPurchasedLeads(contractorUid) {
  try {
    const docRef = contractorsCollection.doc(contractorUid);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Contractor not found');
    }

    const contractorData = snap.data();
    return contractorData.purchasedLeads || [];
  } catch (error) {
    console.error('Error getting contractor purchased leads:', error);
    throw error;
  }
}

/**
 * Add a transaction record to contractor's transaction history
 */
async function addContractorTransaction(contractorUid, transactionData) {
  try {
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(), // Use regular Date instead of serverTimestamp
      status: 'completed',
      ...transactionData
    };

    const docRef = contractorsCollection.doc(contractorUid);
    await docRef.update({
      transactions: admin.firestore.FieldValue.arrayUnion(transaction),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return transaction;
  } catch (error) {
    console.error('Error adding contractor transaction:', error);
    throw error;
  }
}

/**
 * Get contractor's transaction history
 */
async function getContractorTransactions(contractorUid) {
  try {
    const docRef = contractorsCollection.doc(contractorUid);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error('Contractor not found');
    }

    const contractorData = snap.data();
    return contractorData.transactions || [];
  } catch (error) {
    console.error('Error getting contractor transactions:', error);
    throw error;
  }
}

module.exports = {
  createContractor,
  getContractorByUid,
  updateContractor,
  updateContractorStatus,
  getContractorsByStatus,
  deleteContractor,
  contractorExists,
  getContractorsByServices,
  migrateContractorsStatus,
  getContractorCredits,
  deductContractorCredits,
  addContractorCredits,
  addPurchasedLead,
  getContractorPurchasedLeads,
  addContractorTransaction,
  getContractorTransactions
};
