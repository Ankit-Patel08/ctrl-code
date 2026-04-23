const Activity = require('../models/Activity');
const User = require('../models/User');
const logger = require('../utils/logger');

const getLocalDateStr = (date = new Date(), timezone = 'UTC') =>
  new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date);

const dateStrToDay = (str) => new Date(str + 'T12:00:00Z');

const dayDiff = (a, b) => {
  const msA = new Date(a + 'T12:00:00Z').getTime();
  const msB = new Date(b + 'T12:00:00Z').getTime();
  return Math.round((msA - msB) / 86400000);
};

const calculateConsistencyScore = async (userId, days = 30) => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 86400000);

  const activities = await Activity.find({
    userId,
    date: {
      $gte: getLocalDateStr(startDate),
      $lte: getLocalDateStr(endDate),
    },
  });

  const activeDays = activities.filter(a => a.goalMet).length;
  const baseScore = (activeDays / days) * 100;

  // Bonus for consecutive streaks, penalty for gaps
  let streakBonus = 0;
  const sortedDates = activities
    .filter(a => a.goalMet)
    .map(a => a.date)
    .sort();

  let currentRun = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    if (dayDiff(sortedDates[i], sortedDates[i - 1]) === 1) {
      currentRun++;
      if (currentRun >= 7) streakBonus += 0.5;
    } else {
      currentRun = 1;
    }
  }

  return Math.min(100, Math.round(baseScore + streakBonus));
};

const recalculateStreak = async (userId, timezone = 'UTC') => {
  const today = getLocalDateStr(new Date(), timezone);
  const yesterday = getLocalDateStr(new Date(Date.now() - 86400000), timezone);

  const recentActivities = await Activity.find({ userId, goalMet: true })
    .sort({ date: -1 })
    .limit(400);

  if (!recentActivities.length) {
    return { current: 0, longest: 0 };
  }

  const dates = recentActivities.map(a => a.date).sort().reverse();

  let current = 0;
  let check = today;

  for (const date of dates) {
    if (date === check || (current === 0 && date === yesterday)) {
      current++;
      const d = new Date(date + 'T12:00:00Z');
      d.setUTCDate(d.getUTCDate() - 1);
      check = d.toISOString().slice(0, 10);
    } else if (date < check) {
      break;
    }
  }

  // Calculate longest
  let longest = 0;
  let run = 1;
  const sorted = [...dates].sort();
  for (let i = 1; i < sorted.length; i++) {
    if (dayDiff(sorted[i], sorted[i - 1]) === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  longest = Math.max(longest, current, 1);

  return { current, longest };
};

const applyStreakFreeze = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.streakData.freezesAvailable <= 0) throw new Error('No freezes available');

  const today = getLocalDateStr(new Date(), user.timezone);
  user.streakData.freezesAvailable -= 1;
  user.streakData.freezesUsed.push({ date: new Date(), reason: 'manual' });

  // Insert a synthetic goalMet=true activity for today so streak is preserved
  const Activity = require('../models/Activity');
  await Activity.findOneAndUpdate(
    { userId, date: today },
    {
      userId,
      date: today,
      leetcodeUsername: user.leetcodeUsername || 'freeze',
      goalMet: true,
      streakContributed: true,
      fetchSource: 'manual',
      fetchError: 'streak_freeze_applied',
    },
    { upsert: true, new: true }
  );

  await user.save();
  return user.streakData;
};

const getActivityCalendar = async (userId, weeks = 52) => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - weeks * 7 * 86400000);

  const activities = await Activity.find({
    userId,
    date: { $gte: getLocalDateStr(startDate), $lte: getLocalDateStr(endDate) },
  });

  const map = {};
  activities.forEach(a => { map[a.date] = a.problemsSolved; });
  return map;
};

module.exports = {
  calculateConsistencyScore,
  recalculateStreak,
  applyStreakFreeze,
  getActivityCalendar,
  getLocalDateStr,
};
