const axios = require('axios');
const logger = require('../utils/logger');

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

const RECENT_SUBMISSIONS_QUERY = `
query recentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    id
    title
    titleSlug
    timestamp
  }
}`;

const USER_STATS_QUERY = `
query userProblemsSolved($username: String!) {
  matchedUser(username: $username) {
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    userCalendar {
      activeYears
      streak
      totalActiveDays
      submissionCalendar
    }
  }
}`;

const PROFILE_QUERY = `
query userPublicProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      ranking
    }
  }
}`;

const makeGraphQLRequest = async (query, variables, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(
        LEETCODE_GRAPHQL,
        { query, variables },
        {
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
            'User-Agent': 'Mozilla/5.0',
          },
          timeout: 10000,
        }
      );
      if (res.data.errors) throw new Error(res.data.errors[0].message);
      return res.data.data;
    } catch (err) {
      logger.warn(`LeetCode GQL attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
};

const getRecentSubmissions = async (username, limit = 20) => {
  const data = await makeGraphQLRequest(RECENT_SUBMISSIONS_QUERY, { username, limit });
  return data?.recentAcSubmissionList || [];
};

const getUserStats = async (username) => {
  const data = await makeGraphQLRequest(USER_STATS_QUERY, { username });
  const user = data?.matchedUser;
  if (!user) throw new Error(`LeetCode user '${username}' not found`);

  const stats = {};
  const acStats = user.submitStatsGlobal?.acSubmissionNum || [];
  acStats.forEach(({ difficulty, count }) => {
    if (difficulty === 'All') stats.totalSolved = count;
    else if (difficulty === 'Easy') stats.easySolved = count;
    else if (difficulty === 'Medium') stats.mediumSolved = count;
    else if (difficulty === 'Hard') stats.hardSolved = count;
  });

  const calendar = user.userCalendar || {};
  stats.currentStreak = calendar.streak || 0;
  stats.totalActiveDays = calendar.totalActiveDays || 0;
  stats.submissionCalendar = calendar.submissionCalendar
    ? JSON.parse(calendar.submissionCalendar)
    : {};

  return stats;
};

const getSubmissionsForDate = async (username, dateStr, userTimezone = 'UTC') => {
  try {
    const submissions = await getRecentSubmissions(username, 50);
    const targetDate = new Date(dateStr + 'T00:00:00');

    const daySubmissions = submissions.filter(sub => {
      const subDate = new Date(parseInt(sub.timestamp) * 1000);
      const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone })
        .format(subDate);
      return localDate === dateStr;
    });

    return {
      count: daySubmissions.length,
      problems: daySubmissions.map(s => ({
        title: s.title,
        titleSlug: s.titleSlug,
        solvedAt: new Date(parseInt(s.timestamp) * 1000),
        difficulty: 'unknown',
      })),
    };
  } catch (err) {
    logger.error(`Failed to get submissions for ${username} on ${dateStr}: ${err.message}`);
    throw err;
  }
};

const validateLeetCodeUser = async (username) => {
  try {
    const data = await makeGraphQLRequest(PROFILE_QUERY, { username });
    return !!data?.matchedUser;
  } catch {
    return false;
  }
};

module.exports = {
  getRecentSubmissions,
  getUserStats,
  getSubmissionsForDate,
  validateLeetCodeUser,
};
