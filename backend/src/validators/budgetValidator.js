/**
 * Budget input validators.
 */

const ALLOWED_PERIODS = ['weekly', 'monthly', 'yearly'];

function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function validateBudget(body = {}) {
  const errors = [];
  const { category, amount, period, start_date, end_date } = body;

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required.');
  } else if (category.trim().length > 50) {
    errors.push('Category cannot exceed 50 characters.');
  }

  const numAmount = parseFloat(amount);
  if (amount === undefined || amount === null || isNaN(numAmount)) {
    errors.push('Budget amount must be a valid number.');
  } else if (numAmount <= 0) {
    errors.push('Budget amount must be greater than zero.');
  } else if (numAmount > 10000000) {
    errors.push('Budget amount cannot exceed 10,000,000.');
  }

  if (period && !ALLOWED_PERIODS.includes(period)) {
    errors.push(`Period must be one of: ${ALLOWED_PERIODS.join(', ')}.`);
  }

  if (start_date && !isValidDate(start_date)) {
    errors.push('Start date must be a valid date.');
  }

  if (end_date && !isValidDate(end_date)) {
    errors.push('End date must be a valid date.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateBudget,
  ALLOWED_PERIODS
};
