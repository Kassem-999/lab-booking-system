const { pool } = require('../config/db');

const mapEquipment = (row) => ({
  _id: String(row.id),
  name: row.name,
  category: row.category,
  description: row.description || '',
  condition: row.equipment_condition,
  availability: row.availability,
  imageUrl: row.image_url || ''
});

exports.getEquipment = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
    const values = [];
    const where = [];
    if (req.query.category) {
      const categories = req.query.category.split(',');
      where.push(`category IN (${categories.map(() => '?').join(',')})`);
      values.push(...categories);
    }
    if (req.query.availability) {
      const statuses = req.query.availability.split(',');
      where.push(`availability IN (${statuses.map(() => '?').join(',')})`);
      values.push(...statuses);
    }
    if (req.query.search) {
      where.push('(name LIKE ? OR category LIKE ? OR description LIKE ?)');
      const search = `%${req.query.search.trim()}%`;
      values.push(search, search, search);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const order = req.query.sort === 'alphabetical'
      ? 'name ASC'
      : req.query.sort === 'availability'
        ? 'availability ASC, name ASC'
        : 'created_at DESC';
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(`SELECT * FROM equipment ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`, [...values, limit, offset]);
    const [count] = await pool.query(`SELECT COUNT(*) AS total FROM equipment ${clause}`, values);
    const total = Number(count[0].total);
    res.json({ success: true, data: rows.map(mapEquipment), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEquipmentById = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM equipment WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Equipment not found' });
  res.json({ success: true, data: mapEquipment(rows[0]) });
};

exports.createEquipment = async (req, res) => {
  try {
    const { name, category, description, condition = 'good', availability = 'available' } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const [result] = await pool.query(
      'INSERT INTO equipment (name, category, description, equipment_condition, availability, image_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category, description || '', condition, availability, imageUrl, req.user.id]
    );
    const [rows] = await pool.query('SELECT * FROM equipment WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: mapEquipment(rows[0]) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const { name, category, description, condition, availability } = req.body;
    const imagePart = req.file ? ', image_url = ?' : '';
    const values = [name, category, description || '', condition, availability];
    if (req.file) values.push(`/uploads/${req.file.filename}`);
    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE equipment SET name = ?, category = ?, description = ?, equipment_condition = ?, availability = ?${imagePart} WHERE id = ?`,
      values
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Equipment not found' });
    const [rows] = await pool.query('SELECT * FROM equipment WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: mapEquipment(rows[0]) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  const [result] = await pool.query('DELETE FROM equipment WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Equipment not found' });
  res.json({ success: true });
};
