const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    specifications: { type: Map, of: String, default: {} },
    condition: { type: String, enum: ['excellent', 'good', 'maintenance'], default: 'good' },
    availability: { type: String, enum: ['available', 'unavailable', 'maintenance'], default: 'available' },
    imageUrl: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);
