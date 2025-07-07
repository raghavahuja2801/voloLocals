const { getProfile, updateProfile, deleteProfile } = require('../models/userModel');   

exports.getProfile = async (req, res, next) => {
  try {
    const { uid, role } = req.user;
    const profile = await getProfile(uid, role);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
}


exports.updateProfile = async (req, res, next) => {
  console.log('Updating profile with data:');
  try {
    const { uid, role } = req.user;
    
    const {
      displayName,
      phone,
      address // Address object with street, city, province, postalCode
    } = req.body;

    const updates = {};
    if (displayName !== undefined) {
      updates.name = displayName; // Map to schema field name
      updates.displayName = displayName; // Keep for backward compatibility
    }
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    if (Object.keys(updates).length === 0) {
      res.status(400);
      throw new Error('No valid fields to update');
    }

    // Update lastActive for users
    if (role === 'user') {
      updates.lastActive = require('../config/firebaseAdmin').admin.firestore.FieldValue.serverTimestamp();
    }

    const updatedProfile = await updateProfile(uid, role, updates);
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: updatedProfile 
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    const { uid, role } = req.user;
    await deleteProfile(uid, role);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

