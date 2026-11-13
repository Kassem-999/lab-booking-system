const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const controller = require('../controllers/reservationController');

const router = express.Router();
router.get('/availability', protect, controller.getAvailability);
router.route('/').get(protect, controller.getReservations).post(protect, controller.createReservation);
router.put('/:id/status', protect, authorize('staff', 'admin'), controller.updateReservation);
module.exports = router;
