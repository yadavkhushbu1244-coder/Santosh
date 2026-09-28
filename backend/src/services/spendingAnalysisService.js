const {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateSavings,
  calculateSavingsRate,
  calculateCategoryTotals,
  calculateMonthlyTotals,
  calculateBudgetUsage,
  calculateAverageDailySpending
} = require('../utils/calculations');

/**
 * Service to deeply analyze user spending habits from their transaction and budget history.
 */
class SpendingAnalysisService {
  /**
   * Run full comprehensive spending analysis.
   * @param {Array} transactions 
   * @param {Array} budgets 
   */
  static analyze(transactions = [], budgets = []) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    const totalIncome = calculateTotalIncome(income);
    const totalExpenses = calculateTotalExpenses(expenses);
    const netBalance = calculateBalance(totalIncome, totalExpenses);
    const savings = calculateSavings(totalIncome, totalExpenses);
    const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

    // Current month filter
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthTransactions = transactions.filter(t => {
      if (!t.transaction_date) return false;
      const d = new Date(t.transaction_date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const currentMonthExpenses = calculateTotalExpenses(currentMonthTransactions);
    const currentMonthIncome = calculateTotalIncome(currentMonthTransactions);

    // Previous month filter for month-over-month calculation
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();

    const prevMonthTransactions = transactions.filter(t => {
      if (!t.transaction_date) return false;
      const d = new Date(t.transaction_date);
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    });

    const prevMonthExpenses = calculateTotalExpenses(prevMonthTransactions);
    const prevMonthIncome = calculateTotalIncome(prevMonthTransactions);

    // Month-over-month expense change percentage
    let momExpenseChange = 0;
    if (prevMonthExpenses > 0) {
      momExpenseChange = Math.round(((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 1000) / 10;
    }

    // Category Totals (for all time and current month)
    const categoryTotals = calculateCategoryTotals(transactions);
    const currentMonthCategoryTotals = calculateCategoryTotals(currentMonthTransactions);

    const highestSpendingCategory = categoryTotals.length > 0 ? categoryTotals[0] : null;

    // Largest individual expenses
    const largestExpenses = [...expenses]
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        description: t.description,
        amount: parseFloat(t.amount),
        category: t.category,
        date: t.transaction_date
      }));

    // Detect potential recurring expenses (e.g. same description/amount in Subscriptions or Gaming)
    const recurringCandidates = SpendingAnalysisService.detectRecurringExpenses(expenses);

    // Budget utilization
    const budgetUtilization = budgets.map(b => {
      // Find spent amount in this budget's category in the current month
      const spent = currentMonthTransactions
        .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const usage = calculateBudgetUsage(b.amount, spent);
      return {
        id: b.id,
        category: b.category,
        period: b.period,
        ...usage
      };
    });

    // Average daily spending (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysTransactions = transactions.filter(t => {
      return t.transaction_date && new Date(t.transaction_date) >= thirtyDaysAgo;
    });
    const avgDailySpending = calculateAverageDailySpending(last30DaysTransactions, 30);

    // Monthly totals for charts
    const monthlyTrends = calculateMonthlyTotals(transactions);

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      savings,
      savingsRate,
      transactionCount: transactions.length,
      currentMonth: {
        income: currentMonthIncome,
        expenses: currentMonthExpenses,
        net: currentMonthIncome - currentMonthExpenses,
        categoryTotals: currentMonthCategoryTotals,
        momExpenseChange
      },
      previousMonth: {
        income: prevMonthIncome,
        expenses: prevMonthExpenses
      },
      categoryTotals,
      highestSpendingCategory,
      largestExpenses,
      recurringExpenses: recurringCandidates,
      budgetUtilization,
      avgDailySpending,
      monthlyTrends
    };
  }

  /**
   * Helper to identify recurring subscriptions or repeated expenses.
   */
  static detectRecurringExpenses(expenses = []) {
    const itemMap = {};

    for (const exp of expenses) {
      const key = `${exp.description.trim().toLowerCase()}_${exp.amount}`;
      if (!itemMap[key]) {
        itemMap[key] = {
          description: exp.description,
          amount: parseFloat(exp.amount),
          category: exp.category,
          dates: []
        };
      }
      itemMap[key].dates.push(exp.transaction_date);
    }

    // Filter to items appearing 2 or more times
    return Object.values(itemMap)
      .filter(item => item.dates.length >= 2)
      .map(item => ({
        description: item.description,
        amount: item.amount,
        category: item.category,
        occurrences: item.dates.length,
        estimatedMonthlyCost: Math.round(item.amount * (item.dates.length >= 3 ? 1 : 1) * 100) / 100
      }));
  }
}

module.exports = SpendingAnalysisService;
