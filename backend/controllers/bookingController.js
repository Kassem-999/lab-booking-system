const { pool } = require('../config/db');

exports.createBooking = async (req, res) => {
  try {
    const { labId, date, startTime, endTime, reason } = req.body;
    const [labs] = await pool.query('SELECT id FROM labs WHERE id = ?', [labId]);
    if (!labs.length) return res.status(404).json({ message: 'Lab not found' });
    const [conflicts] = await pool.query(
      `SELECT id FROM bookings WHERE lab_id = ? AND date = ? AND status IN ('pending', 'approved')
       AND start_time < ? AND end_time > ? LIMIT 1`,
      [labId, date, endTime, startTime]
    );
    if (conflicts.length) return res.status(409).json({ message: 'Lab already reserved for this time slot' });
    const [result] = await pool.query(
      'INSERT INTO bookings (lab_id, user_id, date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [labId, req.user.id, date, startTime, endTime, reason || '']
    );
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  const isManager = ['staff', 'admin'].includes(req.user.role);
  const [rows] = await pool.query(
    `SELECT b.*, l.name AS lab_name, l.capacity, u.name AS user_name, u.email AS user_email, u.role AS user_role
     FROM bookings b JOIN labs l ON l.id = b.lab_id JOIN users u ON u.id = b.user_id
     ${isManager ? '' : 'WHERE b.user_id = ?'} ORDER BY b.date DESC, b.start_time DESC`,
    isManager ? [] : [req.user.id]
  );
  res.json({ success: true, count: rows.length, data: rows });
};

exports.updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'returned'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const [result] = await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Booking not found' });
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: rows[0] });
};
