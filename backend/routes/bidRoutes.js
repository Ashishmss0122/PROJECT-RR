const express = require('express');
const bidController = require('../controllers/bidController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, bidController.placeBid);
router.get('/project/:projectId', authMiddleware, bidController.getBidsByProject);
router.get('/my-bids', authMiddleware, bidController.getMyBids);
router.put('/:id/status', authMiddleware, bidController.updateBidStatus);

module.exports = router;
