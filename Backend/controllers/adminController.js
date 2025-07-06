// controllers/adminController.js
const e = require('express');
const { admin } = require('../config/firebaseAdmin');

/**
 * POST /api/admin/users/:uid/role
 * Body: { role: 'user' | 'contractor' | 'admin' }
 */
exports.setUserRole = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    // validate
    const allowed = ['user','contractor','admin'];
    if (!allowed.includes(role)) {
      res.status(400);
      throw new Error(`Invalid role. Allowed: ${allowed.join(', ')}`);
    }

    // set custom claim
    await admin.auth().setCustomUserClaims(uid, { role });
    res.json({ success: true, uid, role });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = [];
    const listUsersResult = await admin.auth().listUsers();
    listUsersResult.users.forEach(userRecord => {
      users.push({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: userRecord.customClaims?.role || 'user',
        createdAt: userRecord.metadata.creationTime
      });
    });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}
