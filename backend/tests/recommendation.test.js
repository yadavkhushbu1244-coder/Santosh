const RecommendationService = require('../src/services/recommendationService');

describe('Recommendation Service', () => {
  test('returns friendly welcome suggestion when no transactions exist', () => {
    const suggestions = RecommendationService.generateSuggestions({ transactionCount: 0 }, []);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].id).toBe('welcome-tip');
    expect(suggestions[0].type).toBe('info');
  });

  test('flags over-budget and near-limit warnings from budget utilization', () => {
    const mockAnalysis = {
      transactionCount: 10,
      totalIncome: 5000,
      totalExpenses: 4000,
      savingsRate: 20,
      budgetUtilization: [
        {
          id: 'b-1',
          category: 'Food',
          budgetAmount: 2000,
          spentAmount: 2200,
          remaining: -200,
          percentageUsed: 110,
          status: 'over_budget'
        },
        {
          id: 'b-2',
          category: 'Gaming',
          budgetAmount: 1000,
          spentAmount: 950,
          remaining: 50,
          percentageUsed: 95,
          status: 'near_limit'
        }
      ]
    };

    const suggestions = RecommendationService.generateSuggestions(mockAnalysis, []);
    const budgetWarnings = suggestions.filter(s => s.type === 'warning');
    expect(budgetWarnings.length).toBeGreaterThanOrEqual(2);
    expect(budgetWarnings.some(s => s.title.includes('Food budget limit exceeded'))).toBe(true);
    expect(budgetWarnings.some(s => s.title.includes('Gaming budget nearly used up'))).toBe(true);
  });

  test('congratulates user when savings rate is >= 20%', () => {
    const mockAnalysis = {
      transactionCount: 5,
      totalIncome: 10000,
      totalExpenses: 6000,
      savingsRate: 40,
      budgetUtilization: []
    };

    const suggestions = RecommendationService.generateSuggestions(mockAnalysis, []);
    const successTip = suggestions.find(s => s.id === 'positive-savings-rate');
    expect(successTip).toBeDefined();
    expect(successTip.type).toBe('success');
    expect(successTip.message).toContain('40%');
  });

  test('identifies high spending category when over 35% of total', () => {
    const mockAnalysis = {
      transactionCount: 5,
      totalIncome: 5000,
      totalExpenses: 3000,
      savingsRate: 40,
      highestSpendingCategory: {
        category: 'Shopping',
        total: 1500,
        percentage: 50
      },
      budgetUtilization: []
    };

    const suggestions = RecommendationService.generateSuggestions(mockAnalysis, []);
    const catTip = suggestions.find(s => s.id === 'high-category-Shopping');
    expect(catTip).toBeDefined();
    expect(catTip.title).toContain('Shopping is your largest expense area');
  });
});
