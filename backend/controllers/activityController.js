const Activity = require('../models/Activity');
const User = require('../models/User');
const { getActivityCalendar, calculateConsistencyScore } = require('../services/streakService');
const { processUser } = require('../jobs');
const { getLocalDateStr } = require('../services/streakService');

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = getLocalDateStr(new Date(), user.timezone);
    const thirtyDaysAgo = getLocalDateStr(new Date(Date.now() - 30 * 86400000), user.timezone);

    const [todayActivity, recentActivities, calendar] = await Promise.all([
      Activity.findOne({ userId: user._id, date: today }),
      Activity.find({
        userId: user._id,
        date: { $gte: thirtyDaysAgo },
      }).sort({ date: -1 }).limit(30),
      getActivityCalendar(user._id, 26),
    ]);

    res.json({
      user: user.toPublicJSON(),
      todayActivity: todayActivity || { date: today, problemsSolved: 0, goalMet: false },
      recentActivities,
      calendar,
      consistencyScore: user.stats.consistencyScore,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

exports.triggerSync = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.leetcodeUsername) return res.status(400).json({ error: 'No LeetCode username set' });

    await processUser(user);
    const updated = await User.findById(req.user.id);
    res.json({ message: 'Sync complete', user: updated.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed' });
  }
};

exports.getActivityHistory = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const user = await User.findById(req.user.id);
    const since = getLocalDateStr(new Date(Date.now() - parseInt(days) * 86400000), user.timezone);

    const activities = await Activity.find({
      userId: user._id,
      date: { $gte: since },
    }).sort({ date: 1 });

    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
