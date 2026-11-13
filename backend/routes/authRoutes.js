const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// روت محمية تتطلب Token صحيح
router.get('/me', protect, getProfile);

// روت خاصة بالـ admin فقط
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'مرحباً بك في لوحة تحكم الإدارة!'
  });
});

module.exports = router;