const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { validateLeetCodeUser } = require('../services/leetcodeService');

router.patch('/profile', auth, async (req, res) => {
  try {
    const allowed = ['timezone', 'leetcodeUsername', 'notificationPrefs', 'avatarUrl'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.leetcodeUsername) {
      const valid = await validateLeetCodeUser(updates.leetcodeUsername);
      if (!valid) return res.status(400).json({ error: 'LeetCode username not found' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
