const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getLabs, createLab } = require('../controllers/labController');
const { protect, authorize } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '')}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router
  .route('/')
  .get(protect, getLabs)
  .post(protect, authorize('admin'), upload.single('photo'), createLab);

module.exports = router;