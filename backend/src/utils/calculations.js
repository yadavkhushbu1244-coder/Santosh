/**
 * Reusable financial calculation functions.
 * Pure functions: safe, deterministic, and easily testable.
 */

/**
 * Calculate total income from a list of transactions.
 * @param {Array<{type: string, amount: number|string}>} transactions
 * @returns {number} Total income rounded to 2 decimal places.
 */
function calculateTotalIncome(transactions = []) {
  const sum = transactions
    .filter(t => t && t.type === 'income')
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Calculate total expenses from a list of transactions.
 * @param {Array<{type: string, amount: number|string}>} transactions
 * @returns {number} Total expenses rounded to 2 decimal places.
 */
function calculateTotalExpenses(transactions = []) {
  const sum = transactions
    .filter(t => t && t.type === 'expense')
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Calculate net balance: Income - Expenses.
 * @param {number} totalIncome 
 * @param {number} totalExpenses 
 * @returns {number} Balance rounded to 2 decimal places.
 */
function calculateBalance(totalIncome = 0, totalExpenses = 0) {
  return Math.round((Number(totalIncome) - Number(totalExpenses)) * 100) / 100;
}

/**
 * Calculate total savings (net remaining funds).
 * If balance is negative, savings is 0.
 * @param {number} totalIncome
 * @param {number} totalExpenses
 * @returns {number} Savings.
 */
function calculateSavings(totalIncome = 0, totalExpenses = 0) {
  const diff = Number(totalIncome) - Number(totalExpenses);
  return Math.max(0, Math.round(diff * 100) / 100);
}

/**
 * Calculate savings rate as a percentage: (Savings / Income) * 100.
 * @param {number} totalIncome
 * @param {number} totalExpenses
 * @returns {number} Savings rate percentage (0 - 100).
 */
function calculateSavingsRate(totalIncome = 0, totalExpenses = 0) {
  const inc = Number(totalIncome);
  const exp = Number(totalExpenses);
  if (inc <= 0) return 0;
  const savings = Math.max(0, inc - exp);
  const rate = (savings / inc) * 100;
  return Math.min(100, Math.round(rate * 10) / 10);
}

/**
 * Group and sum expenses by category.
 * @param {Array<{type: string, category: string, amount: number|string}>} transactions
 * @returns {Array<{category: string, total: number, percentage: number}>}
 */
function calculateCategoryTotals(transactions = []) {
  const expenses = transactions.filter(t => t && t.type === 'expense');
  const totalExpense = calculateTotalExpenses(expenses);

  const categoryMap = {};
  for (const t of expenses) {
    const cat = t.category || 'Other';
    const amt = parseFloat(t.amount) || 0;
    categoryMap[cat] = (categoryMap[cat] || 0) + amt;
  }

  return Object.entries(categoryMap)
    .map(([category, sum]) => {
      const total = Math.round(sum * 100) / 100;
      const percentage = totalExpense > 0 ? Math.round((total / totalExpense) * 1000) / 10 : 0;
      return { category, total, percentage };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Group transactions into monthly totals (income and expense).
 * @param {Array<{transaction_date: string, type: string, amount: number|string}>} transactions
 * @param {number} monthsCount - default last 6 months
 * @returns {Array<{month: string, income: number, expense: number, net: number}>}
 */
function calculateMonthlyTotals(transactions = []) {
  const monthlyMap = {};

  for (const t of transactions) {
    if (!t.transaction_date) continue;
    const dateObj = new Date(t.transaction_date);
    if (isNaN(dateObj.getTime())) continue;

    // YYYY-MM key
    const yearMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    if (!monthlyMap[yearMonth]) {
      monthlyMap[yearMonth] = {
        key: yearMonth,
        month: monthLabel,
        income: 0,
        expense: 0
      };
    }

    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'income') {
      monthlyMap[yearMonth].income += amt;
    } else if (t.type === 'expense') {
      monthlyMap[yearMonth].expense += amt;
    }
  }

  return Object.values(monthlyMap)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(item => ({
      key: item.key,
      month: item.month,
      income: Math.round(item.income * 100) / 100,
      expense: Math.round(item.expense * 100) / 100,
      net: Math.round((item.income - item.expense) * 100) / 100
    }));
}

/**
 * Calculate budget usage status and percentage.
 * Thresholds:
 * - 0% - 70%: 'normal'
 * - 70% - 90%: 'approaching_limit'
 * - 90% - 100%: 'near_limit'
 * - >100%: 'over_budget'
 *
 * @param {number} budgetAmount
 * @param {number} spentAmount
 * @returns {{
 *   budgetAmount: number,
 *   spentAmount: number,
 *   remaining: number,
 *   percentageUsed: number,
 *   status: 'normal'|'approaching_limit'|'near_limit'|'over_budget'
 * }}
 */
function calculateBudgetUsage(budgetAmount = 0, spentAmount = 0) {
  const budget = Math.max(0, Number(budgetAmount) || 0);
  const spent = Math.max(0, Number(spentAmount) || 0);
  const remaining = Math.round((budget - spent) * 100) / 100;
  const percentage = budget > 0 ? Math.round((spent / budget) * 1000) / 10 : 0;

  let status = 'normal';
  if (percentage > 100) {
    status = 'over_budget';
  } else if (percentage >= 90) {
    status = 'near_limit';
  } else if (percentage >= 70) {
    status = 'approaching_limit';
  }

  return {
    budgetAmount: Math.round(budget * 100) / 100,
    spentAmount: Math.round(spent * 100) / 100,
    remaining,
    percentageUsed: percentage,
    status
  };
}

/**
 * Calculate average daily spending over a specified range of days (e.g., 30 days).
 * @param {Array<{type: string, amount: number|string, transaction_date: string}>} transactions
 * @param {number} daysCount
 * @returns {number} Average daily spend.
 */
function calculateAverageDailySpending(transactions = [], daysCount = 30) {
  const safeDays = Math.max(1, daysCount);
  const total = calculateTotalExpenses(transactions);
  return Math.round((total / safeDays) * 100) / 100;
}

module.exports = {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateSavings,
  calculateSavingsRate,
  calculateCategoryTotals,
  calculateMonthlyTotals,
  calculateBudgetUsage,
  calculateAverageDailySpending
};
