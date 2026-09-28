/**
 * Recommendation Service
 * Generates clear, non-judgmental, explainable suggestions for teenagers
 * based strictly on their own spending data and budgets.
 * 
 * DISCLAIMER: These are informational tips, not formal financial advice.
 */

class RecommendationService {
  /**
   * Generates actionable suggestions from analysis output.
   * @param {Object} analysis - Output from SpendingAnalysisService.analyze()
   * @param {Array} savingsGoals - User's active savings goals
   * @returns {Array<{id: string, type: 'info'|'warning'|'success'|'tip', title: string, message: string, reason: string}>}
   */
  static generateSuggestions(analysis, savingsGoals = []) {
    const suggestions = [];

    if (!analysis || analysis.transactionCount === 0) {
      return [
        {
          id: 'welcome-tip',
          type: 'info',
          title: 'Welcome to your money dashboard! 🚀',
          message: 'Start by logging your allowance or recent purchases. You will begin seeing personalized spending insights right here.',
          reason: 'No transactions recorded yet.'
        }
      ];
    }

    // 1. Budget Utilization Pressure (Approaching or Over Budget)
    if (analysis.budgetUtilization && analysis.budgetUtilization.length > 0) {
      for (const b of analysis.budgetUtilization) {
        if (b.status === 'over_budget') {
          suggestions.push({
            id: `budget-over-${b.id}`,
            type: 'warning',
            title: `${b.category} budget limit exceeded`,
            message: `You've spent ₹${b.spentAmount.toLocaleString()} of your ₹${b.budgetAmount.toLocaleString()} ${b.category} budget (${b.percentageUsed}%). You might want to pause non-essential ${b.category} purchases until next period.`,
            reason: `Category spending exceeded 100% of your allocated budget.`
          });
        } else if (b.status === 'near_limit') {
          suggestions.push({
            id: `budget-near-${b.id}`,
            type: 'warning',
            title: `${b.category} budget nearly used up`,
            message: `You have used ${b.percentageUsed}% of your ${b.category} budget with ₹${b.remaining.toLocaleString()} remaining. Keeping an eye on daily snacks or items here can keep you on track.`,
            reason: `Budget utilization is between 90% and 100%.`
          });
        } else if (b.status === 'approaching_limit') {
          suggestions.push({
            id: `budget-approach-${b.id}`,
            type: 'info',
            title: `${b.category} budget pace check`,
            message: `You are at ${b.percentageUsed}% of your ${b.category} budget. You're doing great—just remember to pace your spending for the rest of the month!`,
            reason: `Budget utilization reached 70%.`
          });
        }
      }
    }

    // 2. Highest Spending Category Insight
    if (analysis.highestSpendingCategory && analysis.highestSpendingCategory.percentage >= 35) {
      const topCat = analysis.highestSpendingCategory;
      suggestions.push({
        id: `high-category-${topCat.category}`,
        type: 'tip',
        title: `${topCat.category} is your largest expense area`,
        message: `${topCat.category} represents ${topCat.percentage}% of your total spending (₹${topCat.total.toLocaleString()}). If you're saving for a goal, trimming a few small purchases here can free up extra cash.`,
        reason: `${topCat.category} accounts for more than 35% of total recorded expenses.`
      });
    }

    // 3. Positive Savings Encouragement
    if (analysis.savingsRate >= 20) {
      suggestions.push({
        id: 'positive-savings-rate',
        type: 'success',
        title: 'Awesome savings pace! ⭐',
        message: `You saved ${analysis.savingsRate}% of your income this period! Building this habit now gives you huge financial superpowers as you grow.`,
        reason: `Your savings rate is ${analysis.savingsRate}%, which is comfortably above the recommended 20% benchmark.`
      });
    } else if (analysis.currentMonth && analysis.currentMonth.momExpenseChange < 0) {
      suggestions.push({
        id: 'mom-expense-drop',
        type: 'success',
        title: 'Spending dropped from last month! 📉',
        message: `Your expenses decreased by ${Math.abs(analysis.currentMonth.momExpenseChange)}% compared to last month. Great job managing your wallet!`,
        reason: 'Month-over-month expenses declined.'
      });
    }

    // 4. Subscriptions & Recurring Charges Check
    if (analysis.recurringExpenses && analysis.recurringExpenses.length > 0) {
      const sample = analysis.recurringExpenses[0];
      suggestions.push({
        id: 'recurring-subscription-review',
        type: 'info',
        title: 'Subscription & recurring check',
        message: `You have recurring expenses like "${sample.description}" (₹${sample.amount}). Take a quick look once in a while to ensure you are still actively using each service.`,
        reason: `Detected multiple recurring transactions with identical amounts.`
      });
    }

    // 5. Savings Goal Momentum
    if (savingsGoals && savingsGoals.length > 0) {
      const activeGoal = savingsGoals.find(g => (g.current_amount / g.target_amount) < 1);
      if (activeGoal) {
        const percent = Math.round((activeGoal.current_amount / activeGoal.target_amount) * 100);
        const needed = activeGoal.target_amount - activeGoal.current_amount;
        if (percent >= 75) {
          suggestions.push({
            id: `goal-near-complete-${activeGoal.id}`,
            type: 'success',
            title: `Almost reached: ${activeGoal.name}! 🎯`,
            message: `You're at ${percent}% of your goal! Only ₹${needed.toLocaleString()} left to achieve it. Keep up the great focus!`,
            reason: `Goal progress is over 75%.`
          });
        }
      }
    }

    // Fallback encouraging tip if none triggered
    if (suggestions.length === 0) {
      suggestions.push({
        id: 'balanced-spending-tip',
        type: 'tip',
        title: 'Balanced spending rhythm 👍',
        message: 'Your spending looks steady and evenly distributed. Setting a fun savings goal can give your extra pocket money a clear purpose!',
        reason: 'Transactions are balanced without extreme spikes.'
      });
    }

    return suggestions;
  }
}

module.exports = RecommendationService;
