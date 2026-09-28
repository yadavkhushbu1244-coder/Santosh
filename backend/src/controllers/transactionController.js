const transactionModel = require('../models/transactionModel');
const logger = require('../utils/logger');

/**
 * Get all transactions with filtering and pagination.
 */
async function getTransactions(req, res, next) {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      limit = 50,
      offset = 0,
      sortBy = 'transaction_date',
      sortOrder = 'desc'
    } = req.query;

    const result = await transactionModel.getTransactions(req.supabase, req.user.id, {
      type,
      category,
      startDate,
      endDate,
      search,
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0,
      sortBy,
      sortOrder
    });

    return res.status(200).json({
      success: true,
      data: result.transactions,
      meta: {
        totalCount: result.totalCount,
        limit: result.limit,
        offset: result.offset
      },
      message: 'Transactions retrieved successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single transaction by ID.
 */
async function getTransactionById(req, res, next) {
  try {
    const { id } = req.params;
    const transaction = await transactionModel.getTransactionById(req.supabase, req.user.id, id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
        errors: [`No transaction found with id: ${id}`]
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
      message: 'Transaction details retrieved.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new transaction (income or expense).
 */
async function createTransaction(req, res, next) {
  try {
    const created = await transactionModel.createTransaction(req.supabase, req.user.id, req.body);

    return res.status(201).json({
      success: true,
      data: created,
      message: `${created.type === 'income' ? 'Income' : 'Expense'} recorded successfully!`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing transaction.
 */
async function updateTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await transactionModel.getTransactionById(req.supabase, req.user.id, id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or you do not have permission to modify it.',
        errors: ['Transaction not found']
      });
    }

    const updated = await transactionModel.updateTransaction(req.supabase, req.user.id, id, req.body);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Transaction updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a transaction.
 */
async function deleteTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await transactionModel.getTransactionById(req.supabase, req.user.id, id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or you do not have permission to delete it.',
        errors: ['Transaction not found']
      });
    }

    await transactionModel.deleteTransaction(req.supabase, req.user.id, id);

    return res.status(200).json({
      success: true,
      data: { id },
      message: 'Transaction deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
