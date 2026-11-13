const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (existing.length) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, normalizedEmail, hashedPassword, 'student']
    );
    const user = { id: result.insertId, name, email: normalizedEmail, role: 'student' };

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        ...publicUser(user),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );
    const user = rows[0];
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        ...publicUser(user),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};