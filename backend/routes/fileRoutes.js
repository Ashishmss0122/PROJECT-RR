const express = require('express');
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Multer storage configuration for contract work files
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'work-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadWork = multer({ storage: fileStorage });

router.post('/upload/:contractId', authMiddleware, uploadWork.single('workFile'), fileController.uploadFile);
router.get('/download/:fileId', authMiddleware, fileController.downloadFile);

module.exports = router;
