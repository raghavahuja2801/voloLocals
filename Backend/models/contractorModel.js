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

module.exports = {
  createContractor,
  getContractorByUid,
  updateContractor,
  updateContractorStatus,
  getContractorsByStatus,
  deleteContractor,
  contractorExists,
  getContractorsByServices,
  migrateContractorsStatus
};
