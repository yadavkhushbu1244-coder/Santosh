const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

// All dashboard endpoints require authentication
router.use(authenticate);

router.get('/', dashboardController.getDashboardOverview);
router.get('/summary', dashboardController.getSummary);
router.get('/spending-by-category', dashboardController.getSpendingByCategory);
router.get('/monthly-trends', dashboardController.getMonthlyTrends);
router.get('/recommendations', dashboardController.getRecommendations);

module.exports = router;
