const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: [true, 'Lab is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reason: {
      type: String,
      required: [true, 'Booking reason is required']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);