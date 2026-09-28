/**
 * Transaction input validators.
 */

const ALLOWED_TYPES = ['income', 'expense'];
const ALLOWED_PAYMENT_METHODS = [
  'Cash',
  'UPI / Card',
  'Bank Transfer',
  'Allowance / Pocket Money',
  'Digital Wallet',
  'Other'
];

function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function validateTransaction(body = {}) {
  const errors = [];
  const { type, amount, category, description, transaction_date, payment_method, notes } = body;

  // Type
  if (!type || !ALLOWED_TYPES.includes(type)) {
    errors.push(`Type must be one of: ${ALLOWED_TYPES.join(', ')}.`);
  }

  // Amount
  const numAmount = parseFloat(amount);
  if (amount === undefined || amount === null || isNaN(numAmount)) {
    errors.push('Amount must be a valid number.');
  } else if (numAmount <= 0) {
    errors.push('Amount must be greater than zero.');
  } else if (numAmount > 10000000) {
    errors.push('Amount cannot exceed 10,000,000.');
  }

  // Category
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required.');
  } else if (category.trim().length > 50) {
    errors.push('Category cannot exceed 50 characters.');
  }

  // Description
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required.');
  } else if (description.trim().length > 255) {
    errors.push('Description cannot exceed 255 characters.');
  }

  // Date
  if (transaction_date && !isValidDate(transaction_date)) {
    errors.push('Transaction date must be a valid date.');
  }

  // Payment Method
  if (payment_method && typeof payment_method === 'string' && payment_method.length > 50) {
    errors.push('Payment method cannot exceed 50 characters.');
  }

  // Notes
  if (notes && (typeof notes !== 'string' || notes.length > 1000)) {
    errors.push('Notes cannot exceed 1,000 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateTransactionUpdate(body = {}) {
  const errors = [];
  const { type, amount, category, description, transaction_date, payment_method, notes } = body;

  if (type !== undefined && !ALLOWED_TYPES.includes(type)) {
    errors.push(`Type must be one of: ${ALLOWED_TYPES.join(', ')}.`);
  }

  if (amount !== undefined) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push('Amount must be a number greater than zero.');
    } else if (numAmount > 10000000) {
      errors.push('Amount cannot exceed 10,000,000.');
    }
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim().length === 0) {
      errors.push('Category cannot be empty.');
    } else if (category.trim().length > 50) {
      errors.push('Category cannot exceed 50 characters.');
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length === 0) {
      errors.push('Description cannot be empty.');
    } else if (description.trim().length > 255) {
      errors.push('Description cannot exceed 255 characters.');
    }
  }

  if (transaction_date !== undefined && !isValidDate(transaction_date)) {
    errors.push('Transaction date must be a valid date.');
  }

  if (payment_method !== undefined && (typeof payment_method !== 'string' || payment_method.length > 50)) {
    errors.push('Payment method cannot exceed 50 characters.');
  }

  if (notes !== undefined && (typeof notes !== 'string' || notes.length > 1000)) {
    errors.push('Notes cannot exceed 1,000 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateTransaction,
  validateTransactionUpdate,
  ALLOWED_TYPES,
  ALLOWED_PAYMENT_METHODS
};
