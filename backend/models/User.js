const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  leetcodeUsername: { type: String, trim: true, default: null },
  verified: { type: Boolean, default: false },
  avatarUrl: { type: String, default: null },
  timezone: { type: String, default: 'UTC' },

  streakData: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    freezesAvailable: { type: Number, default: 2 },
    freezesUsed: [{ date: Date, reason: String }],
  },

  stats: {
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 },
    activeDays: { type: Number, default: 0 },
  },

  goals: [{
    title: String,
    targetProblems: Number,
    deadline: Date,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  }],

  notificationPrefs: {
    email: { type: Boolean, default: true },
    emailTime: { type: String, default: '20:00' },
    reminderEnabled: { type: Boolean, default: true },
    nudgeStyle: {
      type: String,
      enum: ['motivational', 'strict', 'friendly', 'competitive'],
      default: 'motivational',
    },
  },

  notificationLog: [{
    type: { type: String },
    sentAt: Date,
    channel: String,
    messagePreview: String,
  }],

  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  weeklyRank: { type: Number, default: null },
  monthlyRank: { type: Number, default: null },

  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.notificationLog;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
