const { pool } = require('../config/db');

const reservationQuery = `
  SELECT r.id, r.start_date AS startDate, r.end_date AS endDate, r.notes, r.status,
         e.id AS equipmentId, e.name AS equipmentName, e.category, e.image_url AS imageUrl,
         u.id AS userId, u.name AS userName, u.email AS userEmail, u.role AS userRole
  FROM reservations r
  JOIN equipment e ON e.id = r.equipment_id
  JOIN users u ON u.id = r.user_id
`;

const mapReservation = (row) => ({
  _id: String(row.id),
  startDate: row.startDate,
  endDate: row.endDate,
  notes: row.notes || '',
  status: row.status,
  equipment: { _id: String(row.equipmentId), name: row.equipmentName, category: row.category, imageUrl: row.imageUrl || '' },
  user: { id: row.userId, name: row.userName, email: row.userEmail, role: row.userRole }
});

exports.createReservation = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { equipment, startDate, endDate, notes } = req.body;
    if (!equipment || !startDate || !endDate || startDate > endDate) {
      return res.status(400).json({ message: 'A valid equipment and date range are required' });
    }
    await connection.beginTransaction();
    const [items] = await connection.query('SELECT id, availability FROM equipment WHERE id = ? FOR UPDATE', [equipment]);
    if (!items.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Equipment not found' });
    }
    if (items[0].availability !== 'available') {
      await connection.rollback();
      return res.status(409).json({ message: 'Equipment is not available' });
    }
    const [conflicts] = await connection.query(
      `SELECT id FROM reservations WHERE equipment_id = ? AND status IN ('pending', 'approved') AND start_date <= ? AND end_date >= ? LIMIT 1`,
      [equipment, endDate, startDate]
    );
    if (conflicts.length) {
      await connection.rollback();
      return res.status(409).json({ message: 'Equipment is already reserved for those dates' });
    }
    const [result] = await connection.query(
      'INSERT INTO reservations (equipment_id, user_id, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?)',
      [equipment, req.user.id, startDate, endDate, notes || '']
    );
    await connection.commit();
    const [rows] = await pool.query(`${reservationQuery} WHERE r.id = ?`, [result.insertId]);
    res.status(201).json({ success: true, data: mapReservation(rows[0]) });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ message: error.message });
  } finally {
    connection.release();
  }
};

exports.getReservations = async (req, res) => {
  try {
    const values = [];
    const filters = [];
    if (!['staff', 'admin'].includes(req.user.role)) {
      filters.push('r.user_id = ?');
      values.push(req.user.id);
    }
    if (req.query.status) {
      filters.push('r.status = ?');
      values.push(req.query.status);
    }
    const [rows] = await pool.query(`${reservationQuery}${filters.length ? ` WHERE ${filters.join(' AND ')}` : ''} ORDER BY r.created_at DESC`, values);
    res.json({ success: true, count: rows.length, data: rows.map(mapReservation) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'returned'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const [rows] = await pool.query('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Reservation not found' });
    const reservation = rows[0];
    if (status === 'approved') {
      const [conflicts] = await pool.query(
        `SELECT id FROM reservations WHERE id <> ? AND equipment_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ? LIMIT 1`,
        [reservation.id, reservation.equipment_id, reservation.end_date, reservation.start_date]
      );
      if (conflicts.length) return res.status(409).json({ message: 'Another approved reservation overlaps this range' });
    }
    await pool.query('UPDATE reservations SET status = ?, reviewed_by = ? WHERE id = ?', [status, req.user.id, req.params.id]);
    const [updated] = await pool.query(`${reservationQuery} WHERE r.id = ?`, [req.params.id]);
    res.json({ success: true, data: mapReservation(updated[0]) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAvailability = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT start_date AS startDate, end_date AS endDate, status FROM reservations
     WHERE equipment_id = ? AND status IN ('pending', 'approved') AND start_date <= ? AND end_date >= ?`,
    [req.query.equipment, req.query.endDate, req.query.startDate]
  );
  res.json({ success: true, available: rows.length === 0, data: rows });
};
