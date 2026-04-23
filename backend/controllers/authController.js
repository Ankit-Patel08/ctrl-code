const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateLeetCodeUser } = require('../services/leetcodeService');
const logger = require('../utils/logger');

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}


const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

exports.register = async (req, res) => {
  try {
    const { username, email, password, leetcodeUsername, timezone } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'Username, email, and password are required' });

    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      return res.status(409).json({ error: `${field} already in use` });
    }

    if (leetcodeUsername) {
      const valid = await validateLeetCodeUser(leetcodeUsername);
      if (!valid) return res.status(400).json({ error: 'LeetCode username not found' });
    }

    const user = await User.create({
      username,
      email,
      password,
      leetcodeUsername: leetcodeUsername || null,
      timezone: timezone || 'UTC',
    });

    const token = signToken(user._id);
    logger.info(`New user registered: ${username}`);
    res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    logger.error(`Register error: ${err.message}`);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });
    const token = signToken(user._id);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
