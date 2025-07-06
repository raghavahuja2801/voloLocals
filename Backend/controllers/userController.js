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
  try {
    const { uid, role } = req.user;
    const profileData = req.body; // Assuming body contains the profile fields to update
    const updatedProfile = await updateProfile(uid, role, profileData);
    res.json({ success: true, profile: updatedProfile });
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

