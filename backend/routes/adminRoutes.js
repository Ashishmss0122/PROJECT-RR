const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Inline Admin role verification middleware
const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
};

router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.get('/projects', authMiddleware, adminMiddleware, adminController.getAllProjects);
router.get('/contracts', authMiddleware, adminMiddleware, adminController.getAllContracts);
router.delete('/projects/:id', authMiddleware, adminMiddleware, adminController.deleteSpamProject);
router.delete('/users/:id', authMiddleware, adminMiddleware, adminController.deleteSpamUser);

module.exports = router;
