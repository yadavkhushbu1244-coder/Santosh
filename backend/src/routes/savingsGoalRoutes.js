const express = require('express');
const router = express.Router();
const savingsGoalController = require('../controllers/savingsGoalController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { validateSavingsGoal } = require('../validators/savingsGoalValidator');

// All savings goal endpoints require authentication
router.use(authenticate);

router.get('/', savingsGoalController.getSavingsGoals);
router.post('/', validate(validateSavingsGoal), savingsGoalController.createSavingsGoal);
router.put('/:id', savingsGoalController.updateSavingsGoal);
router.delete('/:id', savingsGoalController.deleteSavingsGoal);

module.exports = router;
