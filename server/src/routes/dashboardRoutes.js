const express = require('express');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect);
router.get('/recruiter', authorize('RECRUITER'), dashboardController.getRecruiterDashboard);
router.get('/admin', authorize('ADMIN'), dashboardController.getAdminDashboard);

module.exports = router;
