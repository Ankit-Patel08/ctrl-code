const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD in user's timezone
  leetcodeUsername: { type: String, required: true },

  problemsSolved: { type: Number, default: 0 },
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },

  recentProblems: [{
    title: String,
    titleSlug: String,
    difficulty: String,
    solvedAt: Date,
  }],

  goalMet: { type: Boolean, default: false }, // solved >= 1
  streakContributed: { type: Boolean, default: false },

  fetchedAt: { type: Date, default: Date.now },
  fetchSource: { type: String, enum: ['graphql', 'scrape', 'manual'], default: 'graphql' },
  fetchError: { type: String, default: null },
}, { timestamps: true });

activitySchema.index({ userId: 1, date: 1 }, { unique: true });
activitySchema.index({ date: 1 });

module.exports = mongoose.model('Activity', activitySchema);
