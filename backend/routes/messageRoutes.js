const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, messageController.sendMessage);
router.get('/users', authMiddleware, messageController.getChatsList);
router.get('/thread/:otherUserId', authMiddleware, messageController.getMessageThread);

module.exports = router;
