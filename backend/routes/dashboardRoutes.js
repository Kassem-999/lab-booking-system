const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMetrics } = require('../controllers/dashboardController');

const router = express.Router();
router.get('/metrics', protect, authorize('admin'), getMetrics);
module.exports = router;
