const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const {
  validateRegister,
  validateLogin,
  validateVaultPin
} = require('../validators/authValidator');

// Public Auth Endpoints with strict brute-force rate limiting
router.post('/register', authLimiter, validate(validateRegister), authController.register);
router.post('/login', authLimiter, validate(validateLogin), authController.login);

// Protected Auth & Profile Endpoints
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

// Secret Vault / Parental Lock PIN (bcrypt application security)
router.post('/vault-pin', authenticate, validate(validateVaultPin), authController.setVaultPin);
router.post('/verify-vault-pin', authenticate, validate(validateVaultPin), authController.verifyVaultPin);

module.exports = router;
