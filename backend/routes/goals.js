const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.post('/', auth, async (req, res) => {
  try {
    const { title, targetProblems, deadline } = req.body;
    if (!title || !targetProblems) return res.status(400).json({ error: 'Title and target required' });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { goals: { title, targetProblems, deadline, active: true } } },
      { new: true }
    );
    res.status(201).json({ goals: user.goals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('goals stats');
    res.json({ goals: user.goals, stats: user.stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

router.patch('/:goalId', auth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, 'goals._id': req.params.goalId },
      { $set: { 'goals.$.active': req.body.active } },
      { new: true }
    );
    res.json({ goals: user.goals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

module.exports = router;
