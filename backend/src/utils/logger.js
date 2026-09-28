/**
 * Simple structured logger utility.
 * Sanitizes sensitive fields (passwords, tokens, keys) before logging.
 */
const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'key', 'vault_pin'];

function sanitize(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitize);

  const clean = {};
  for (const [k, v] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk))) {
      clean[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      clean[k] = sanitize(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

const logger = {
  info: (msg, meta) => {
    console.log(`[INFO]  [${new Date().toISOString()}] ${msg}`, meta ? sanitize(meta) : '');
  },
  warn: (msg, meta) => {
    console.warn(`[WARN]  [${new Date().toISOString()}] ${msg}`, meta ? sanitize(meta) : '');
  },
  error: (msg, meta) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, meta ? sanitize(meta) : '');
  },
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] [${new Date().toISOString()}] ${msg}`, meta ? sanitize(meta) : '');
    }
  }
};

module.exports = logger;
