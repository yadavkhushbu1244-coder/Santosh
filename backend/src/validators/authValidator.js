/**
 * Authentication request validators.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_REGEX = /^\d{4,6}$/;

function validateRegister(body = {}) {
  const errors = [];
  const { email, password, displayName, currency } = body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters.');
  }

  if (displayName && (typeof displayName !== 'string' || displayName.trim().length > 100)) {
    errors.push('Display name cannot exceed 100 characters.');
  }

  if (currency && (typeof currency !== 'string' || currency.trim().length > 10)) {
    errors.push('Currency code must be a string up to 10 characters (e.g. INR, USD, EUR).');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateLogin(body = {}) {
  const errors = [];
  const { email, password } = body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateVaultPin(body = {}) {
  const errors = [];
  const { pin } = body;

  if (!pin || typeof pin !== 'string' || !PIN_REGEX.test(pin.trim())) {
    errors.push('Secret Vault PIN must be 4 to 6 numeric digits.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateVaultPin
};
