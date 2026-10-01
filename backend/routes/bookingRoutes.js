const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

router
  .route('/:id/status')
  .put(protect, authorize('admin'), updateBookingStatus);

module.exports = router;