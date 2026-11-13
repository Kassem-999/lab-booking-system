const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');

const activeStatuses = { $in: ['pending', 'approved'] };
const overlap = (startDate, endDate) => ({
  $or: [
    { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
  ]
});

exports.createReservation = async (req, res) => {
  try {
    const { equipment, startDate, endDate, notes } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!equipment || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      return res.status(400).json({ message: 'A valid equipment and date range are required' });
    }
    const item = await Equipment.findById(equipment);
    if (!item) return res.status(404).json({ message: 'Equipment not found' });
    if (item.availability !== 'available') return res.status(409).json({ message: 'Equipment is not available' });
    const conflict = await Reservation.findOne({ equipment, status: activeStatuses, ...overlap(start, end) });
    if (conflict) return res.status(409).json({ message: 'Equipment is already reserved for those dates' });
    const reservation = await Reservation.create({ equipment, user: req.user._id, startDate: start, endDate: end, notes });
    res.status(201).json({ success: true, data: await reservation.populate('equipment', 'name category imageUrl') });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getReservations = async (req, res) => {
  try {
    const filter = ['staff', 'admin'].includes(req.user.role) ? {} : { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const data = await Reservation.find(filter)
      .populate('equipment', 'name category imageUrl')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'returned'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (status === 'approved') {
      const conflict = await Reservation.findOne({
        _id: { $ne: reservation._id },
        equipment: reservation.equipment,
        status: 'approved',
        ...overlap(reservation.startDate, reservation.endDate)
      });
      if (conflict) return res.status(409).json({ message: 'Another approved reservation overlaps this range' });
    }
    reservation.status = status;
    reservation.reviewedBy = req.user._id;
    await reservation.save();
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAvailability = async (req, res) => {
  const { equipment, startDate, endDate } = req.query;
  const data = await Reservation.find({ equipment, status: activeStatuses, ...overlap(new Date(startDate), new Date(endDate)) })
    .select('startDate endDate status');
  res.json({ success: true, available: data.length === 0, data });
};
