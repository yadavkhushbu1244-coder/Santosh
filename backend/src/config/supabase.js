const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  logger.warn('SUPABASE_URL is missing in environment variables. Database operations may fail.');
}

/**
 * Public Anonymous Supabase client.
 */
const supabaseAnon = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

/**
 * Privileged Service Role Supabase client.
 * Strictly used for server-side auth verification and administrative tasks.
 * NEVER exposed to the frontend.
 */
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

/**
 * Creates a user-scoped Supabase client that carries the caller's JWT.
 * Ensures PostgreSQL RLS policies (auth.uid() = user_id) are natively enforced.
 * @param {string} userJwtToken 
 */
function createUserClient(userJwtToken) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${userJwtToken}`
      }
    }
  });
}

module.exports = {
  supabaseAnon,
  supabaseAdmin,
  createUserClient
};
