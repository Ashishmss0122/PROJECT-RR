const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-ledger', authMiddleware, paymentController.getMyLedger);

module.exports = router;
