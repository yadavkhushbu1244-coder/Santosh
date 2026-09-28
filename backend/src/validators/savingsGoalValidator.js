/**
 * Savings Goal input validators.
 */

function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function validateSavingsGoal(body = {}) {
  const errors = [];
  const { name, target_amount, current_amount, deadline } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Goal name is required.');
  } else if (name.trim().length > 150) {
    errors.push('Goal name cannot exceed 150 characters.');
  }

  const numTarget = parseFloat(target_amount);
  if (target_amount === undefined || target_amount === null || isNaN(numTarget)) {
    errors.push('Target amount must be a valid number.');
  } else if (numTarget <= 0) {
    errors.push('Target amount must be greater than zero.');
  } else if (numTarget > 10000000) {
    errors.push('Target amount cannot exceed 10,000,000.');
  }

  if (current_amount !== undefined && current_amount !== null) {
    const numCurrent = parseFloat(current_amount);
    if (isNaN(numCurrent) || numCurrent < 0) {
      errors.push('Current amount must be a number greater than or equal to zero.');
    }
  }

  if (deadline && !isValidDate(deadline)) {
    errors.push('Deadline must be a valid date.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateSavingsGoal
};
