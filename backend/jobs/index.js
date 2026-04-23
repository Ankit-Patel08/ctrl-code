const cron = require('node-cron');
const User = require('../models/User');
const Activity = require('../models/Activity');
const leetcodeService = require('../services/leetcodeService');
const { sendNudgeNotification } = require('../services/notificationService');
const {
  recalculateStreak,
  calculateConsistencyScore,
  getLocalDateStr,
} = require('../services/streakService');
const logger = require('../utils/logger');

// Notification deduplication: track sent notifications to avoid duplicate alerts
const notificationCache = new Set();

const getCacheKey = (userId, date, type) => `${userId}:${date}:${type}`;

const fetchAndSyncUserActivity = async (user, dateStr) => {
  if (!user.leetcodeUsername) return null;

  try {
    const data = await leetcodeService.getSubmissionsForDate(
      user.leetcodeUsername,
      dateStr,
      user.timezone
    );

    const activity = await Activity.findOneAndUpdate(
      { userId: user._id, date: dateStr },
      {
        $set: {
          userId: user._id,
          date: dateStr,
          leetcodeUsername: user.leetcodeUsername,
          problemsSolved: data.count,
          goalMet: data.count >= 1,
          recentProblems: data.problems,
          fetchedAt: new Date(),
          fetchSource: 'graphql',
          fetchError: null,
        },
      },
      { upsert: true, new: true }
    );

    logger.info(`Synced activity for ${user.username} on ${dateStr}: ${data.count} problems`);
    return activity;
  } catch (err) {
    logger.error(`Activity sync failed for ${user.username}: ${err.message}`);

    await Activity.findOneAndUpdate(
      { userId: user._id, date: dateStr },
      {
        $setOnInsert: {
          userId: user._id,
          date: dateStr,
          leetcodeUsername: user.leetcodeUsername,
          problemsSolved: 0,
          goalMet: false,
          fetchSource: 'graphql',
          fetchError: err.message,
        },
      },
      { upsert: true, new: true }
    );
    return null;
  }
};

const processUser = async (user) => {
  const today = getLocalDateStr(new Date(), user.timezone);
  const yesterday = getLocalDateStr(new Date(Date.now() - 86400000), user.timezone);

  // Fetch today's activity
  await fetchAndSyncUserActivity(user, today);

  // Check yesterday (final check — day is over)
  const yesterdayActivity = await fetchAndSyncUserActivity(user, yesterday);

  // Recalculate streak
  const { current, longest } = await recalculateStreak(user._id, user.timezone);
  const consistencyScore = await calculateConsistencyScore(user._id);

  // Update user stats
  try {
    const ltStats = await leetcodeService.getUserStats(user.leetcodeUsername);
    await User.findByIdAndUpdate(user._id, {
      'streakData.current': current,
      'streakData.longest': Math.max(longest, user.streakData.longest),
      'streakData.lastActiveDate': current > 0 ? new Date() : user.streakData.lastActiveDate,
      'stats.consistencyScore': consistencyScore,
      'stats.totalSolved': ltStats.totalSolved || user.stats.totalSolved,
      'stats.easySolved': ltStats.easySolved || user.stats.easySolved,
      'stats.mediumSolved': ltStats.mediumSolved || user.stats.mediumSolved,
      'stats.hardSolved': ltStats.hardSolved || user.stats.hardSolved,
      lastSeen: new Date(),
    });
  } catch (err) {
    logger.warn(`Stats update failed for ${user.username}: ${err.message}`);
    await User.findByIdAndUpdate(user._id, {
      'streakData.current': current,
      'streakData.longest': Math.max(longest, user.streakData.longest),
      'stats.consistencyScore': consistencyScore,
    });
  }

  // Smart notification logic
  if (!user.notificationPrefs?.reminderEnabled) return;

  const todayActivity = await Activity.findOne({ userId: user._id, date: today });
  const missedYesterday = yesterdayActivity && !yesterdayActivity.goalMet;
  const missedToday = !todayActivity || !todayActivity.goalMet;

  // Evening reminder: only after configured time, only if not yet solved today
  const nowHour = new Date().getUTCHours();
  const [prefHour] = (user.notificationPrefs.emailTime || '20:00').split(':').map(Number);
  const isReminderTime = nowHour >= prefHour;

  if (missedToday && isReminderTime) {
    const key = getCacheKey(user._id, today, 'missedOne');
    if (!notificationCache.has(key)) {
      notificationCache.add(key);

      let notifType = 'missedOne';
      if (missedYesterday) notifType = 'missedTwo';
      else if (user.streakData.current >= 7 && user.streakData.freezesAvailable > 0) {
        notifType = 'streakRecovery';
      }

      await sendNudgeNotification(user, notifType);

      // Log notification
      await User.findByIdAndUpdate(user._id, {
        $push: {
          notificationLog: {
            type: notifType,
            sentAt: new Date(),
            channel: 'email',
            messagePreview: `Missed day alert: ${today}`,
          },
        },
      });
    }
  }
};

const runDailySync = async () => {
  logger.info('Starting daily sync job...');

  const users = await User.find({
    leetcodeUsername: { $ne: null },
    'notificationPrefs.reminderEnabled': true,
  }).lean(false);

  logger.info(`Processing ${users.length} users`);

  // Process in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(processUser));
    if (i + batchSize < users.length) {
      await new Promise(r => setTimeout(r, 2000)); // 2s between batches
    }
  }

  // Clear old cache entries (keep only today's)
  const today = getLocalDateStr(new Date());
  for (const key of notificationCache) {
    if (!key.includes(today)) notificationCache.delete(key);
  }

  logger.info('Daily sync job completed');
};

const updateLeaderboards = async () => {
  logger.info('Updating leaderboards...');
  const weekAgo = getLocalDateStr(new Date(Date.now() - 7 * 86400000));

  const results = await Activity.aggregate([
    { $match: { date: { $gte: weekAgo }, goalMet: true } },
    { $group: { _id: '$userId', weeklyCount: { $sum: '$problemsSolved' } } },
    { $sort: { weeklyCount: -1 } },
  ]);

  await Promise.all(
    results.map((r, idx) =>
      User.findByIdAndUpdate(r._id, { weeklyRank: idx + 1 })
    )
  );

  logger.info('Leaderboards updated');
};

const initCronJobs = () => {
  // Main sync: every hour between 8am-11pm UTC
  cron.schedule('0 8-23 * * *', runDailySync, { timezone: 'UTC' });

  // Leaderboard update: every 6 hours
  cron.schedule('0 */6 * * *', updateLeaderboards, { timezone: 'UTC' });

  // Clean notification cache: daily at midnight
  cron.schedule('0 0 * * *', () => notificationCache.clear(), { timezone: 'UTC' });

  logger.info('Cron jobs initialized');
};

module.exports = { initCronJobs, runDailySync, processUser };
