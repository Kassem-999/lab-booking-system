const Equipment = require('../models/Equipment');
const Reservation = require('../models/Reservation');
const User = require('../models/user');

exports.getMetrics = async (_req, res) => {
  const [equipment, activeBookings, pendingApprovals, users] = await Promise.all([
    Equipment.countDocuments(),
    Reservation.countDocuments({ status: 'approved' }),
    Reservation.countDocuments({ status: 'pending' }),
    User.countDocuments()
  ]);
  res.json({ success: true, data: { equipment, activeBookings, pendingApprovals, users } });
};
