const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { validateBudget } = require('../validators/budgetValidator');

// All budget endpoints require authentication
router.use(authenticate);

router.get('/', budgetController.getBudgets);
router.post('/', validate(validateBudget), budgetController.createBudget);
router.put('/:id', validate(validateBudget), budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
