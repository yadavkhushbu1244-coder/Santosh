const transactionModel = require('../models/transactionModel');
const budgetModel = require('../models/budgetModel');
const savingsGoalModel = require('../models/savingsGoalModel');
const SpendingAnalysisService = require('./spendingAnalysisService');
const RecommendationService = require('./recommendationService');

class DashboardService {
  /**
   * Retrieves complete dashboard data package for authenticated user.
   */
  static async getDashboardData(supabaseClient, userId) {
    // Parallelize data fetching for optimal performance
    const [transactions, budgets, savingsGoals] = await Promise.all([
      transactionModel.getAllUserTransactions(supabaseClient, userId),
      budgetModel.getBudgets(supabaseClient, userId),
      savingsGoalModel.getSavingsGoals(supabaseClient, userId)
    ]);

    const analysis = SpendingAnalysisService.analyze(transactions, budgets);
    const recommendations = RecommendationService.generateSuggestions(analysis, savingsGoals);

    // Latest 5 transactions
    const recentTransactions = transactions.slice(0, 5);

    return {
      summary: {
        balance: analysis.netBalance,
        totalIncome: analysis.totalIncome,
        totalExpenses: analysis.totalExpenses,
        savings: analysis.savings,
        savingsRate: analysis.savingsRate,
        currentMonth: analysis.currentMonth,
        transactionCount: analysis.transactionCount
      },
      charts: {
        categoryTotals: analysis.categoryTotals,
        monthlyTrends: analysis.monthlyTrends,
        budgetUtilization: analysis.budgetUtilization
      },
      recentTransactions,
      savingsGoals,
      recommendations
    };
  }
}

module.exports = DashboardService;
