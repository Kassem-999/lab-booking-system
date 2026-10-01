const Booking = require('../models/Booking');
const Lab = require('../models/Lab');

// @desc    Créer une nouvelle réservation
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { labId, date, startTime, endTime, reason } = req.body;

    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab non trouvé' });
    }

    const existingBooking = await Booking.findOne({
      lab: labId,
      date: new Date(date),
      startTime,
      status: { $ne: 'rejected' }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Lab déjà réservé pour ce créneau' });
    }

    const booking = await Booking.create({
      lab: labId,
      user: req.user._id,
      date,
      startTime,
      endTime,
      reason
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir toutes les réservations
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      query = Booking.find().populate('lab', 'name capacity').populate('user', 'name email role');
    } else {
      query = Booking.find({ user: req.user._id }).populate('lab', 'name capacity');
    }

    const bookings = await query;
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Changer le statut d'une réservation (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createBooking, getBookings, updateBookingStatus };