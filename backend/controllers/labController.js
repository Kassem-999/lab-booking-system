const { pool } = require('../config/db');

const mapLab = (row) => ({
  _id: String(row.id),
  id: row.id,
  name: row.name,
  capacity: row.capacity,
  equipment: row.equipment ? row.equipment.split(',').map((item) => item.trim()).filter(Boolean) : [],
  description: row.description || '',
  imageUrl: row.image_url || '',
  availability: row.is_available ? 'available' : 'unavailable',
  isAvailable: Boolean(row.is_available)
});

exports.getLabs = async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM labs ORDER BY name');
  res.json({ success: true, count: rows.length, data: rows.map(mapLab) });
};

exports.createLab = async (req, res) => {
  try {
    const { name, capacity, equipment = [], description = '', isAvailable = 'true' } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const available = isAvailable === true || isAvailable === 'true' ? 1 : 0;
    const [result] = await pool.query(
      'INSERT INTO labs (name, capacity, equipment, description, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)',
      [name, capacity, Array.isArray(equipment) ? equipment.join(', ') : equipment, description, imageUrl, available]
    );
    const [rows] = await pool.query('SELECT * FROM labs WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: mapLab(rows[0]) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getLabById = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM labs WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Lab not found' });
  res.json({ success: true, data: mapLab(rows[0]) });
};

exports.updateLab = async (req, res) => {
  try {
    const { name, capacity, equipment = [], description = '', isAvailable = 'true' } = req.body;
    const imagePart = req.file ? ', image_url = ?' : '';
    const available = isAvailable === true || isAvailable === 'true' ? 1 : 0;
    const values = [name, Number(capacity) || 1, Array.isArray(equipment) ? equipment.join(', ') : equipment, description, available];
    if (req.file) values.push(`/uploads/${req.file.filename}`);
    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE labs SET name = ?, capacity = ?, equipment = ?, description = ?, is_available = ?${imagePart} WHERE id = ?`,
      values
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Lab not found' });
    const [rows] = await pool.query('SELECT * FROM labs WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: mapLab(rows[0]) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
