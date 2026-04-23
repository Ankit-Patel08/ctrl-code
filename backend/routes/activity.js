// routes/activity.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDashboard, triggerSync, getActivityHistory } = require('../controllers/activityController');
const { applyStreakFreeze } = require('../services/streakService');

router.get('/dashboard', auth, getDashboard);
router.post('/sync', auth, triggerSync);
router.get('/history', auth, getActivityHistory);
router.post('/freeze', auth, async (req, res) => {
  try {
    const streakData = await applyStreakFreeze(req.user.id);
    res.json({ message: 'Streak freeze applied', streakData });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
