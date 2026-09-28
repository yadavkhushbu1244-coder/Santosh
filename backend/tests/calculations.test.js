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
} = require('../src/utils/calculations');

describe('Financial Calculation Utilities', () => {
  const sampleTransactions = [
    { type: 'income', amount: 5000, category: 'Allowance', transaction_date: '2026-09-01' },
    { type: 'income', amount: 2000, category: 'Tutoring', transaction_date: '2026-09-10' },
    { type: 'expense', amount: 800, category: 'Food', transaction_date: '2026-09-05' },
    { type: 'expense', amount: 1200, category: 'Food', transaction_date: '2026-09-12' },
    { type: 'expense', amount: 1500, category: 'Gaming', transaction_date: '2026-09-15' },
    { type: 'expense', amount: 500, category: 'Transportation', transaction_date: '2026-08-20' }
  ];

  test('calculateTotalIncome sums only income entries correctly', () => {
    const total = calculateTotalIncome(sampleTransactions);
    expect(total).toBe(7000);
  });

  test('calculateTotalExpenses sums only expense entries correctly', () => {
    const total = calculateTotalExpenses(sampleTransactions);
    expect(total).toBe(4000);
  });

  test('calculateBalance correctly calculates net balance (Income - Expenses)', () => {
    const balance = calculateBalance(7000, 4000);
    expect(balance).toBe(3000);
  });

  test('calculateSavings returns non-negative remaining funds', () => {
    expect(calculateSavings(7000, 4000)).toBe(3000);
    expect(calculateSavings(1000, 1500)).toBe(0);
  });

  test('calculateSavingsRate returns accurate percentage', () => {
    // (3000 / 7000) * 100 = 42.857% -> 42.9%
    const rate = calculateSavingsRate(7000, 4000);
    expect(rate).toBe(42.9);
    expect(calculateSavingsRate(0, 100)).toBe(0);
  });

  test('calculateCategoryTotals computes category aggregates and percentages', () => {
    const breakdown = calculateCategoryTotals(sampleTransactions);
    // Total expenses = 4000. Food = 2000 (50%), Gaming = 1500 (37.5%), Transport = 500 (12.5%)
    expect(breakdown).toHaveLength(3);
    expect(breakdown[0].category).toBe('Food');
    expect(breakdown[0].total).toBe(2000);
    expect(breakdown[0].percentage).toBe(50);
  });

  test('calculateBudgetUsage classifies usage states correctly', () => {
    // Normal (<70%)
    const normal = calculateBudgetUsage(1000, 600);
    expect(normal.status).toBe('normal');
    expect(normal.percentageUsed).toBe(60);
    expect(normal.remaining).toBe(400);

    // Approaching limit (70 - 90%)
    const approaching = calculateBudgetUsage(1000, 750);
    expect(approaching.status).toBe('approaching_limit');

    // Near limit (90 - 100%)
    const near = calculateBudgetUsage(1000, 950);
    expect(near.status).toBe('near_limit');

    // Over budget (>100%)
    const over = calculateBudgetUsage(1000, 1200);
    expect(over.status).toBe('over_budget');
    expect(over.remaining).toBe(-200);
  });

  test('calculateAverageDailySpending divides total by days', () => {
    const avg = calculateAverageDailySpending(sampleTransactions, 10);
    // 4000 / 10 = 400
    expect(avg).toBe(400);
  });
});
