const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const NUDGE_TEMPLATES = {
  motivational: {
    missedOne: (user) => ({
      subject: `${user.username}, your streak is at risk 🔥`,
      html: buildTemplate(`
        <h2 style="color:#F59E0B">Day ${user.streakData.current} streak on the line</h2>
        <p>You haven't solved a problem today yet. Your ${user.streakData.current}-day streak is counting on you.</p>
        <p style="font-size:0.9em;color:#888">Every expert was once a beginner who refused to quit.</p>
        ${ctaButton('Solve a Problem Now')}
      `),
    }),
    missedTwo: (user) => ({
      subject: `Miss one day? Fine. Miss two? That's a pattern.`,
      html: buildTemplate(`
        <h2 style="color:#EF4444">2 days missed — but not out</h2>
        <p>You've missed 2 days, ${user.username}. Your ${user.streakData.longest}-day personal best is proof you can do this.</p>
        <p>Start fresh today. One problem. That's all.</p>
        ${ctaButton('Break the Streak of Inactivity')}
      `),
    }),
    streakRecovery: (user) => ({
      subject: `Use a streak freeze before it's too late`,
      html: buildTemplate(`
        <h2 style="color:#8B5CF6">You have ${user.streakData.freezesAvailable} streak freeze(s) available</h2>
        <p>Apply a freeze to protect your streak while you catch up. But don't overuse them!</p>
        ${ctaButton('Apply Streak Freeze')}
      `),
    }),
  },

  strict: {
    missedOne: (user) => ({
      subject: `You haven't coded today.`,
      html: buildTemplate(`
        <h2>Today: 0 problems solved.</h2>
        <p>${user.username} — no activity detected. This is your reminder.</p>
        <p>Rank decay starts at 2 missed days. You're 1 away.</p>
        ${ctaButton('Code Now')}
      `),
    }),
    missedTwo: (user) => ({
      subject: `Streak lost. Rank penalty applied.`,
      html: buildTemplate(`
        <h2 style="color:#EF4444">Streak reset. Consistency score penalized.</h2>
        <p>2 days missed. Your consistency score dropped by 15 points.</p>
        <p>Rebuild starting today.</p>
        ${ctaButton('Start Rebuilding')}
      `),
    }),
  },

  competitive: {
    missedOne: (user, leaderboardContext) => ({
      subject: `${leaderboardContext?.ahead || 3} people just passed you on the leaderboard 📊`,
      html: buildTemplate(`
        <h2 style="color:#06B6D4">You've dropped ${leaderboardContext?.droppedRanks || 2} ranks</h2>
        <p>${user.username}, while you were idle, your competitors were grinding.</p>
        <p>Solve one problem now to stop the slide.</p>
        ${ctaButton('Reclaim Your Rank')}
      `),
    }),
  },
};

const buildTemplate = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0D1117; color: #E6EDF3; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
  .header { border-bottom: 1px solid #21262D; padding-bottom: 20px; margin-bottom: 30px; }
  .logo { font-size: 1.2em; font-weight: 700; color: #F59E0B; letter-spacing: 0.05em; }
  h2 { margin-top: 0; font-size: 1.4em; }
  p { color: #8B949E; line-height: 1.6; }
  .cta { display: inline-block; background: #F59E0B; color: #000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #21262D; font-size: 0.8em; color: #484F58; }
</style></head>
<body><div class="container">
  <div class="header"><span class="logo">⚡ CodeStreak</span></div>
  ${content}
  <div class="footer">
    You're receiving this because you enabled daily reminders.
    <a href="${process.env.FRONTEND_URL}/settings" style="color:#F59E0B">Manage preferences</a>
  </div>
</div></body></html>`;

const ctaButton = (text) =>
  `<a href="${process.env.FRONTEND_URL}/dashboard" class="cta">${text}</a>`;

const sendEmail = async (to, { subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"CodeStreak" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    return false;
  }
};

const sendNudgeNotification = async (user, type, context = {}) => {
  const style = user.notificationPrefs?.nudgeStyle || 'motivational';
  const templates = NUDGE_TEMPLATES[style] || NUDGE_TEMPLATES.motivational;
  const templateFn = templates[type] || templates.missedOne;
  const template = templateFn(user, context);

  if (user.notificationPrefs?.email) {
    return sendEmail(user.email, template);
  }
  return false;
};

module.exports = { sendEmail, sendNudgeNotification };
