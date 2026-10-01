const express = require('express');
const router = express.Router();
const { getLabs, createLab } = require('../controllers/labController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getLabs)
  .post(protect, authorize('admin'), createLab);

module.exports = router;