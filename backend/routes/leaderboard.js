const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { getLocalDateStr } = require('../services/streakService');

router.get('/global', auth, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const days = period === 'monthly' ? 30 : 7;
    const since = getLocalDateStr(new Date(Date.now() - days * 86400000));

    const results = await Activity.aggregate([
      { $match: { date: { $gte: since }, goalMet: true } },
      { $group: { _id: '$userId', score: { $sum: '$problemsSolved' }, activeDays: { $sum: 1 } } },
      { $sort: { score: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          avatarUrl: '$user.avatarUrl',
          leetcodeUsername: '$user.leetcodeUsername',
          streak: '$user.streakData.current',
          score: 1,
          activeDays: 1,
        },
      },
    ]);

    const withRanks = results.map((r, i) => ({ ...r, rank: i + 1 }));
    const myEntry = withRanks.find(r => r._id?.toString() === req.user.id?.toString());

    res.json({ leaderboard: withRanks, myRank: myEntry?.rank || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

module.exports = router;
