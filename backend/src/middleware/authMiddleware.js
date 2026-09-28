const { supabaseAdmin, createUserClient } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Authentication middleware that verifies Supabase JWT access token.
 * Extracts user information and binds a user-scoped Supabase client to `req.supabase`
 * so all downstream database queries inherit Postgres Row Level Security (RLS).
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Missing or malformed Bearer token.',
        errors: ['Authorization header is required with format: Bearer <token>']
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is empty.',
        errors: ['Bearer token is required']
      });
    }

    // Support for test environments or mock tokens in unit tests
    if (process.env.NODE_ENV === 'test' && token.startsWith('test-token-')) {
      const mockUserId = token.replace('test-token-', '');
      req.user = {
        id: mockUserId,
        email: `${mockUserId}@example.com`,
        user_metadata: { display_name: 'Test Teen User' }
      };
      req.supabase = {
        from: () => ({
          select: () => Promise.resolve({ data: [], error: null })
        })
      };
      return next();
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Authentication service not configured on server.',
        errors: ['Supabase configuration missing on backend']
      });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.warn(`Failed token authentication attempt from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
        errors: [error ? error.message : 'User not found for provided token']
      });
    }

    // Attach authenticated user to request context
    req.user = user;

    // Attach user-scoped client for RLS queries
    try {
      req.supabase = createUserClient(token);
    } catch {
      // Fallback: models will use supabaseAdmin with explicit user_id filter if needed
      req.supabase = supabaseAdmin;
    }

    next();
  } catch (err) {
    logger.error('Unexpected error in auth middleware:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server authentication error.',
      errors: [err.message]
    });
  }
}

module.exports = {
  authenticate
};
