const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const publicUser = (row) => ({ id: row.id, name: row.name, email: row.email, role: row.role });
const validRoles = ['admin', 'staff', 'student', 'user'];

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    if (!name || !email || !password || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Name, email, password, and a valid role are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email.trim().toLowerCase(), await bcrypt.hash(password, 10), role]
    );
    const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: publicUser(rows[0]) });
  } catch (error) {
    res.status(400).json({ message: error.code === 'ER_DUP_ENTRY' ? 'Email already exists' : error.message });
  }
};

exports.getUsers = async (_req, res) => {
  const [rows] = await pool.query('SELECT id, name, email, role FROM users ORDER BY id DESC');
  res.json({ success: true, data: rows.map(publicUser) });
};

exports.updateUser = async (req, res) => {
  const { name, email, role } = req.body;
  if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const [result] = await pool.query(
    'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
    [name, email.trim().toLowerCase(), role, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
  const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: publicUser(rows[0]) });
};

exports.deleteUser = async (req, res) => {
  if (String(req.params.id) === String(req.user.id)) return res.status(400).json({ message: 'You cannot delete your own account' });
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
  res.json({ success: true });
};
