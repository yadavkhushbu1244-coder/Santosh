const { validateTransaction, validateTransactionUpdate } = require('../src/validators/transactionValidator');
const { validateRegister, validateLogin, validateVaultPin } = require('../src/validators/authValidator');
const { validateBudget } = require('../src/validators/budgetValidator');
const { validateSavingsGoal } = require('../src/validators/savingsGoalValidator');

describe('Input Validators', () => {
  describe('Transaction Validator', () => {
    test('validates correct expense transaction', () => {
      const valid = {
        type: 'expense',
        amount: 250,
        category: 'Food',
        description: 'School cafeteria lunch',
        transaction_date: '2026-09-28',
        payment_method: 'Cash',
        notes: 'Lunch with classmates'
      };
      const result = validateTransaction(valid);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects negative or zero amount', () => {
      const invalid = {
        type: 'expense',
        amount: -50,
        category: 'Food',
        description: 'Snack'
      };
      const result = validateTransaction(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('greater than zero'))).toBe(true);
    });

    test('rejects missing or invalid type', () => {
      const invalid = {
        type: 'crypto_transfer',
        amount: 100,
        category: 'Other',
        description: 'Invalid'
      };
      const result = validateTransaction(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must be one of: income, expense'))).toBe(true);
    });
  });

  describe('Auth Validator', () => {
    test('validates valid registration payload', () => {
      const valid = {
        email: 'teen@example.com',
        password: 'securePassword123',
        displayName: 'Teen Prodigy',
        currency: 'INR'
      };
      const result = validateRegister(valid);
      expect(result.isValid).toBe(true);
    });

    test('rejects invalid email and short password', () => {
      const invalid = {
        email: 'invalid-email',
        password: '123'
      };
      const result = validateRegister(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });

    test('validates 4-6 digit numeric vault PIN', () => {
      expect(validateVaultPin({ pin: '1234' }).isValid).toBe(true);
      expect(validateVaultPin({ pin: '123456' }).isValid).toBe(true);
      expect(validateVaultPin({ pin: 'abc1' }).isValid).toBe(false);
      expect(validateVaultPin({ pin: '12' }).isValid).toBe(false);
    });
  });

  describe('Budget & Savings Goal Validators', () => {
    test('validates correct budget', () => {
      const budget = {
        category: 'Entertainment',
        amount: 1500,
        period: 'monthly'
      };
      expect(validateBudget(budget).isValid).toBe(true);
    });

    test('validates correct savings goal', () => {
      const goal = {
        name: 'Electric Guitar',
        target_amount: 8000,
        current_amount: 2000,
        deadline: '2026-12-31'
      };
      expect(validateSavingsGoal(goal).isValid).toBe(true);
    });
  });
});
