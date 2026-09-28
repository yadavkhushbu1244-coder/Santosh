const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

/**
 * Fetch profile for authenticated user.
 */
async function getProfile(supabaseClient, userId) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, user_id, display_name, currency, avatar_url, created_at, updated_at, vault_pin_hash')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  // Never return vault_pin_hash to caller, return hasVaultPin boolean
  if (data) {
    const { vault_pin_hash, ...safeProfile } = data;
    return {
      ...safeProfile,
      hasVaultPin: Boolean(vault_pin_hash)
    };
  }

  return null;
}

/**
 * Update display name or currency for authenticated user.
 */
async function updateProfile(supabaseClient, userId, updates) {
  const allowed = {};
  if (updates.display_name !== undefined) allowed.display_name = updates.display_name.trim();
  if (updates.currency !== undefined) allowed.currency = updates.currency.trim().toUpperCase();
  if (updates.avatar_url !== undefined) allowed.avatar_url = updates.avatar_url;

  const { data, error } = await supabaseClient
    .from('profiles')
    .update(allowed)
    .eq('user_id', userId)
    .select('id, user_id, display_name, currency, avatar_url, updated_at')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Sets application-level secret vault PIN using bcrypt.
 * Demonstrates safe server-side credential hashing.
 */
async function setVaultPin(supabaseClient, userId, rawPin) {
  const salt = await bcrypt.genSalt(12);
  const vault_pin_hash = await bcrypt.hash(rawPin, salt);

  const { data, error } = await supabaseClient
    .from('profiles')
    .update({ vault_pin_hash })
    .eq('user_id', userId)
    .select('id, user_id, display_name, currency, updated_at')
    .single();

  if (error) throw error;
  return { success: true, message: 'Secret Vault PIN configured successfully.' };
}

/**
 * Verifies secret vault PIN using bcrypt compare.
 */
async function verifyVaultPin(supabaseClient, userId, rawPin) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('vault_pin_hash')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  if (!data || !data.vault_pin_hash) {
    return { matched: false, hasPin: false };
  }

  const isMatch = await bcrypt.compare(rawPin, data.vault_pin_hash);
  return { matched: isMatch, hasPin: true };
}

module.exports = {
  getProfile,
  updateProfile,
  setVaultPin,
  verifyVaultPin
};
