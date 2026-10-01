const mongoose = require('mongoose');

const labSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم المخبر إجباري'],
      trim: true,
      unique: true
    },
    capacity: {
      type: Number,
      required: [true, 'طاقة الاستيعاب إجبارية']
    },
    equipment: [
      {
        type: String
      }
    ],
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Lab || mongoose.model('Lab', labSchema);