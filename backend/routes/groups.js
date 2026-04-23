const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');
const { nanoid } = require('nanoid');

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPublic, dailyGoal } = req.body;
    const group = await Group.create({
      name,
      description,
      inviteCode: nanoid(8).toUpperCase(),
      members: [{ userId: req.user.id, role: 'admin' }],
      settings: { isPublic, dailyGoal: dailyGoal || 1 },
      createdBy: req.user.id,
    });
    await User.findByIdAndUpdate(req.user.id, { $push: { groups: group._id } });
    res.status(201).json({ group });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

router.post('/join', auth, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const group = await Group.findOne({ inviteCode });
    if (!group) return res.status(404).json({ error: 'Invalid invite code' });

    const alreadyMember = group.members.some(m => m.userId.toString() === req.user.id);
    if (alreadyMember) return res.status(400).json({ error: 'Already a member' });

    group.members.push({ userId: req.user.id, role: 'member' });
    await group.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { groups: group._id } });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join group' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('groups');
    res.json({ groups: user.groups });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

module.exports = router;
