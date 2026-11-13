const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const controller = require('../controllers/userController');

const router = express.Router();
router.route('/').get(protect, authorize('admin'), controller.getUsers).post(protect, authorize('admin'), controller.createUser);
router.put('/:id', protect, authorize('admin'), controller.updateUser);
router.delete('/:id', protect, authorize('admin'), controller.deleteUser);
module.exports = router;
