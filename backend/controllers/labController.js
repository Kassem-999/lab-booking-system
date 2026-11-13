const { pool } = require('../config/db');

const mapLab = (row) => ({
  _id: String(row.id),
  id: row.id,
  name: row.name,
  capacity: row.capacity,
  equipment: row.equipment ? row.equipment.split(',').map((item) => item.trim()).filter(Boolean) : [],
  isAvailable: Boolean(row.is_available)
});

exports.getLabs = async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM labs ORDER BY name');
  res.json({ success: true, count: rows.length, data: rows.map(mapLab) });
};

exports.createLab = async (req, res) => {
  try {
    const { name, capacity, equipment = [] } = req.body;
    const [result] = await pool.query(
      'INSERT INTO labs (name, capacity, equipment) VALUES (?, ?, ?)',
      [name, capacity, Array.isArray(equipment) ? equipment.join(', ') : equipment]
    );
    const [rows] = await pool.query('SELECT * FROM labs WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: mapLab(rows[0]) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
