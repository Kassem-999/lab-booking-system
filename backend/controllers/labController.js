const Lab = require('../models/Lab');

// جلب كل المخابر
const getLabs = async (req, res) => {
  try {
    const labs = await Lab.find();
    res.status(200).json({ success: true, count: labs.length, data: labs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إنشاء مخبر جديد (خاص بالـ Admin برك)
const createLab = async (req, res) => {
  try {
    const { name, capacity, equipment } = req.body;
    const lab = await Lab.create({ name, capacity, equipment });
    res.status(201).json({ success: true, data: lab });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getLabs, createLab };