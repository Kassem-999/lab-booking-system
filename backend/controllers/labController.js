const { pool } = require('../config/db');

const mapLab = (row) => ({
  _id: String(row.id),
  id: row.id,
  name: row.name,
  capacity: row.capacity,
  equipment: row.equipment ? row.equipment.split(',').map((item) => item.trim()).filter(Boolean) : [],
  description: row.description || '',
  isAvailable: Boolean(row.is_available),
  imageUrl: row.image_url || ''
});

exports.getLabs = async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM labs ORDER BY name');
  res.json({ success: true, count: rows.length, data: rows.map(mapLab) });
};

exports.createLab = async (req, res) => {
  try {
    const { name, capacity, equipment = [], description = '' } = req.body;
    const rawAvailability = req.body.isAvailable ?? req.body.is_available;
    const isAvailable = rawAvailability !== undefined
      ? rawAvailability === true || rawAvailability === 'true' || rawAvailability === 1
      : req.body.status === 'available';
    if (!name || String(name).trim() === '') {
      return res.status(400).json({ message: 'Lab name is required' });
    }
    const parsedCapacity = Number(capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      return res.status(400).json({ message: 'Capacity must be a positive whole number' });
    }
    const uploadedFile = req.file || req.files?.photo?.[0] || req.files?.image?.[0];
    const imageUrl = uploadedFile ? `/uploads/${uploadedFile.filename}` : '';
    const equipmentText = Array.isArray(equipment) ? equipment.join(', ') : String(equipment).trim();
    const [result] = await pool.query(
      'INSERT INTO labs (name, capacity, equipment, description, is_available, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [String(name).trim(), parsedCapacity, equipmentText, String(description).trim(), isAvailable === true || isAvailable === 'true' || isAvailable === 1 ? 1 : 0, imageUrl]
    );
    const [rows] = await pool.query('SELECT * FROM labs WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: mapLab(rows[0]) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateLab = async (req, res) => {
  try {
    const { name, capacity, equipment = [], description = '' } = req.body;
    const rawAvailability = req.body.isAvailable ?? req.body.is_available;
    const isAvailable = rawAvailability !== undefined
      ? rawAvailability === true || rawAvailability === 'true' || rawAvailability === 1
      : req.body.status === 'available';
    if (!name || String(name).trim() === '') {
      return res.status(400).json({ message: 'Lab name is required' });
    }
    const parsedCapacity = Number(capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      return res.status(400).json({ message: 'Capacity must be a positive whole number' });
    }
    const [existing] = await pool.query('SELECT * FROM labs WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Lab not found' });
    const uploadedFile = req.file || req.files?.photo?.[0] || req.files?.image?.[0];
    const imagePart = uploadedFile ? ', image_url = ?' : '';
    const equipmentText = Array.isArray(equipment) ? equipment.join(', ') : String(equipment).trim();
    const values = [
      String(name).trim(),
      parsedCapacity,
      equipmentText,
      String(description).trim(),
      isAvailable === true || isAvailable === 'true' || isAvailable === 1 ? 1 : 0
    ];
    if (uploadedFile) values.push(`/uploads/${uploadedFile.filename}`);
    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE labs SET name = ?, capacity = ?, equipment = ?, description = ?, is_available = ?${imagePart} WHERE id = ?`,
      values
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Lab not found' });
    const [rows] = await pool.query('SELECT * FROM labs WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: mapLab(rows[0]) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLab = async (req, res) => {
  const [result] = await pool.query('DELETE FROM labs WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Lab not found' });
  res.json({ success: true });
};
