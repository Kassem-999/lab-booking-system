const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: [true, 'المخبر إجباري']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'المستخدم إجباري']
    },
    date: {
      type: Date,
      required: [true, 'تاريخ الحجز إجباري']
    },
    startTime: {
      type: String, // مثال: "08:30"
      required: [true, 'وقت البداية إجباري']
    },
    endTime: {
      type: String, // مثال: "10:30"
      required: [true, 'وقت النهاية إجباري']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reason: {
      type: String,
      required: [true, 'سبب الحجز إجباري']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);