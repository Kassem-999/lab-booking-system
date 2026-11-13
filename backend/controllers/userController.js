const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !['student', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Name, email, password, and a valid role are required' });
    }
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role });
    res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUsers = async (_req, res) => {
  const data = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data });
};

exports.updateUser = async (req, res) => {
  const { name, email, role } = req.body;
  if (!['student', 'staff', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { name, email, role }, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ success: true, data: user });
};

exports.deleteUser = async (req, res) => {
  if (req.params.id === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete your own account' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ success: true });
};
