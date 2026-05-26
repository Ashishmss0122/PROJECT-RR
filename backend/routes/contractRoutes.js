const express = require('express');
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-contracts', authMiddleware, contractController.getMyContracts);
router.get('/:id', authMiddleware, contractController.getContractById);
router.put('/:id/submit', authMiddleware, contractController.submitContract);
router.put('/:id/complete', authMiddleware, contractController.completeContract);

module.exports = router;
