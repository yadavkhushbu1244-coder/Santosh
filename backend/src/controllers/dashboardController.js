const DashboardService = require('../services/dashboardService');
const SpendingAnalysisService = require('../services/spendingAnalysisService');
const RecommendationService = require('../services/recommendationService');
const transactionModel = require('../models/transactionModel');
const budgetModel = require('../models/budgetModel');
const savingsGoalModel = require('../models/savingsGoalModel');

/**
 * Get comprehensive dashboard overview.
 */
async function getDashboardOverview(req, res, next) {
  try {
    const data = await DashboardService.getDashboardData(req.supabase, req.user.id);
    return res.status(200).json({
      success: true,
      data,
      message: 'Dashboard data retrieved successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get summary cards metrics (Balance, Income, Expenses, Savings, MoM changes).
 */
async function getSummary(req, res, next) {
  try {
    const [transactions, budgets] = await Promise.all([
      transactionModel.getAllUserTransactions(req.supabase, req.user.id),
      budgetModel.getBudgets(req.supabase, req.user.id)
    ]);

    const analysis = SpendingAnalysisService.analyze(transactions, budgets);

    return res.status(200).json({
      success: true,
      data: {
        balance: analysis.netBalance,
        totalIncome: analysis.totalIncome,
        totalExpenses: analysis.totalExpenses,
        savings: analysis.savings,
        savingsRate: analysis.savingsRate,
        currentMonth: analysis.currentMonth,
        avgDailySpending: analysis.avgDailySpending,
        transactionCount: analysis.transactionCount
      },
      message: 'Summary metrics calculated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get spending grouped by category for donut/pie chart.
 */
async function getSpendingByCategory(req, res, next) {
  try {
    const transactions = await transactionModel.getAllUserTransactions(req.supabase, req.user.id);
    const analysis = SpendingAnalysisService.analyze(transactions, []);

    return res.status(200).json({
      success: true,
      data: analysis.categoryTotals,
      message: 'Spending by category retrieved.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get monthly spending and income trends for line/bar charts.
 */
async function getMonthlyTrends(req, res, next) {
  try {
    const transactions = await transactionModel.getAllUserTransactions(req.supabase, req.user.id);
    const analysis = SpendingAnalysisService.analyze(transactions, []);

    return res.status(200).json({
      success: true,
      data: analysis.monthlyTrends,
      message: 'Monthly spending trends retrieved.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get personalized smart suggestions.
 */
async function getRecommendations(req, res, next) {
  try {
    const [transactions, budgets, savingsGoals] = await Promise.all([
      transactionModel.getAllUserTransactions(req.supabase, req.user.id),
      budgetModel.getBudgets(req.supabase, req.user.id),
      savingsGoalModel.getSavingsGoals(req.supabase, req.user.id)
    ]);

    const analysis = SpendingAnalysisService.analyze(transactions, budgets);
    const recommendations = RecommendationService.generateSuggestions(analysis, savingsGoals);

    return res.status(200).json({
      success: true,
      data: recommendations,
      disclaimer: 'These suggestions are informational tips based on your spending history and do not constitute professional financial advice.',
      message: 'Recommendations generated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardOverview,
  getSummary,
  getSpendingByCategory,
  getMonthlyTrends,
  getRecommendations
};
