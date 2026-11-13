const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'returned'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

reservationSchema.index({ equipment: 1, startDate: 1, endDate: 1, status: 1 });
module.exports = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
