const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/authMiddleware');
const controller = require('../controllers/equipmentController');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '')}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();
router.get('/', protect, controller.getEquipment);
router.get('/:id', protect, controller.getEquipmentById);
router.post('/', protect, authorize('staff', 'admin'), upload.single('image'), controller.createEquipment);
router.put('/:id', protect, authorize('staff', 'admin'), upload.single('image'), controller.updateEquipment);
router.delete('/:id', protect, authorize('admin'), controller.deleteEquipment);
module.exports = router;
