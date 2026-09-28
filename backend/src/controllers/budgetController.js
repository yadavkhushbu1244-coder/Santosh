const budgetModel = require('../models/budgetModel');
const transactionModel = require('../models/transactionModel');
const { calculateBudgetUsage } = require('../utils/calculations');

/**
 * Get all budgets for the authenticated user, enriched with real-time spending metrics.
 */
async function getBudgets(req, res, next) {
  try {
    const [budgets, transactions] = await Promise.all([
      budgetModel.getBudgets(req.supabase, req.user.id),
      transactionModel.getAllUserTransactions(req.supabase, req.user.id)
    ]);

    // Current month transactions for budget period checking
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthExpenses = transactions.filter(t => {
      if (t.type !== 'expense' || !t.transaction_date) return false;
      const d = new Date(t.transaction_date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const enrichedBudgets = budgets.map(b => {
      const spent = currentMonthExpenses
        .filter(t => t.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const usage = calculateBudgetUsage(b.amount, spent);
      return {
        ...b,
        spentAmount: usage.spentAmount,
        remainingAmount: usage.remaining,
        percentageUsed: usage.percentageUsed,
        status: usage.status
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedBudgets,
      message: 'Budgets retrieved successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new budget limit.
 */
async function createBudget(req, res, next) {
  try {
    const created = await budgetModel.createBudget(req.supabase, req.user.id, req.body);
    return res.status(201).json({
      success: true,
      data: created,
      message: 'Budget limit established successfully.'
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A budget for this category and period already exists.',
        errors: ['Duplicate budget entry']
      });
    }
    next(err);
  }
}

/**
 * Update an existing budget limit.
 */
async function updateBudget(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await budgetModel.getBudgetById(req.supabase, req.user.id, id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or access denied.',
        errors: ['Budget not found']
      });
    }

    const updated = await budgetModel.updateBudget(req.supabase, req.user.id, id, req.body);
    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Budget updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a budget limit.
 */
async function deleteBudget(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await budgetModel.getBudgetById(req.supabase, req.user.id, id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or access denied.',
        errors: ['Budget not found']
      });
    }

    await budgetModel.deleteBudget(req.supabase, req.user.id, id);
    return res.status(200).json({
      success: true,
      data: { id },
      message: 'Budget deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
