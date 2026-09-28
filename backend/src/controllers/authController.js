const { supabaseAnon, supabaseAdmin } = require('../config/supabase');
const userModel = require('../models/userModel');
const logger = require('../utils/logger');

/**
 * Register a new user with Supabase Auth.
 */
async function register(req, res, next) {
  try {
    const { email, password, displayName = 'Savvy Teen', currency = 'INR' } = req.body;

    if (!supabaseAnon && !supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Supabase client is not configured on server.',
        errors: ['Server configuration missing']
      });
    }

    const client = supabaseAnon || supabaseAdmin;

    const { data, error } = await client.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          currency: currency.trim().toUpperCase()
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: [error.message]
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Check your email if verification is required.',
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          displayName,
          currency
        },
        session: data.session
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Log in an existing user with Supabase Auth.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!supabaseAnon && !supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Supabase client is not configured on server.',
        errors: ['Server configuration missing']
      });
    }

    const client = supabaseAnon || supabaseAdmin;

    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.',
        errors: [error.message]
      });
    }

    // Fetch user profile
    const profile = await userModel.getProfile(supabaseAdmin, data.user.id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          profile
        },
        session: data.session
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Return currently authenticated user profile.
 */
async function getMe(req, res, next) {
  try {
    const profile = await userModel.getProfile(req.supabase, req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          profile
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update authenticated user's profile settings.
 */
async function updateProfile(req, res, next) {
  try {
    const updated = await userModel.updateProfile(req.supabase, req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Set an application-level Secret Vault PIN using bcrypt.
 */
async function setVaultPin(req, res, next) {
  try {
    const { pin } = req.body;
    const result = await userModel.setVaultPin(req.supabase, req.user.id, pin);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify Secret Vault PIN with bcrypt comparison.
 */
async function verifyVaultPin(req, res, next) {
  try {
    const { pin } = req.body;
    const result = await userModel.verifyVaultPin(req.supabase, req.user.id, pin);

    if (!result.hasPin) {
      return res.status(400).json({
        success: false,
        message: 'No secret vault PIN has been created yet.',
        errors: ['PIN not configured']
      });
    }

    if (!result.matched) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect PIN. Access denied.',
        errors: ['Invalid vault PIN']
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vault PIN verified successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  setVaultPin,
  verifyVaultPin
};
