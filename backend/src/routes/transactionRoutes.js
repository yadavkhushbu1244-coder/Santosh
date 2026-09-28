const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  validateTransaction,
  validateTransactionUpdate
} = require('../validators/transactionValidator');

// All transaction endpoints require authentication
router.use(authenticate);

router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.post('/', validate(validateTransaction), transactionController.createTransaction);
router.put('/:id', validate(validateTransactionUpdate), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
