const { supabaseAdmin } = require('./supabase');
const logger = require('../utils/logger');

/**
 * Verifies Supabase connection health by querying system status or profiles table.
 */
async function checkDatabaseConnection() {
  if (!supabaseAdmin) {
    logger.warn('Database health check: supabaseAdmin is not configured.');
    return { status: 'unconfigured', message: 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL missing.' };
  }

  try {
    const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      logger.warn(`Database connection check warning: ${error.message}`);
      return { status: 'connected_with_warning', message: error.message };
    }
    return { status: 'healthy', message: 'Connected to Supabase PostgreSQL database.' };
  } catch (err) {
    logger.error('Database connection error:', err.message);
    return { status: 'error', message: err.message };
  }
}

module.exports = {
  checkDatabaseConnection
};
