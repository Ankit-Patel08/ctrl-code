const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  inviteCode: { type: String, unique: true, required: true },

  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],

  settings: {
    maxMembers: { type: Number, default: 20 },
    isPublic: { type: Boolean, default: false },
    dailyGoal: { type: Number, default: 1 },
    weeklyChallenge: { type: String, default: null },
  },

  leaderboard: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    weeklyScore: { type: Number, default: 0 },
    monthlyScore: { type: Number, default: 0 },
    lastUpdated: Date,
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
