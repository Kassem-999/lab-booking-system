const Equipment = require('../models/Equipment');

const buildFilter = (query) => {
  const filter = {};
  if (query.category) filter.category = { $in: query.category.split(',') };
  if (query.availability) filter.availability = { $in: query.availability.split(',') };
  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: regex }, { category: regex }, { description: regex }];
  }
  return filter;
};

exports.getEquipment = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
    const filter = buildFilter(req.query);
    const sort = { newest: { createdAt: -1 }, alphabetical: { name: 1 }, availability: { availability: 1, name: 1 } }[req.query.sort] || { createdAt: -1 };
    const [data, total] = await Promise.all([
      Equipment.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Equipment.countDocuments(filter)
    ]);
    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEquipmentById = async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
  res.json({ success: true, data: equipment });
};

exports.createEquipment = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
    const equipment = await Equipment.create(data);
    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    res.json({ success: true, data: equipment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  const equipment = await Equipment.findByIdAndDelete(req.params.id);
  if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
  res.json({ success: true });
};
