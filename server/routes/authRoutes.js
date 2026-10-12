const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/store');
const { requireAdmin } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

const JWT_SECRET = process.env.JWT_SECRET || 'disasterguard_demo_jwt_secret_key_change_in_production_2026';

// Rate limit login attempts: max 10 per minute per IP
router.post('/login', rateLimiter({ windowMs: 60 * 1000, max: 10, message: 'Too many login attempts. Please wait a minute before trying again.' }), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check development demo login bypass if enabled
    const isDemoLoginEnabled = process.env.ENABLE_DEMO_LOGIN === 'true';
    const demoAdminEmail = (process.env.DEMO_ADMIN_EMAIL || 'admin@disasterguard.org').toLowerCase();
    const demoAdminPass = process.env.DEMO_ADMIN_PASSWORD || 'admin123';

    let user = await store.getUserByEmail(cleanEmail);

    // If user not found in store but demo login is explicitly enabled and matches demo credentials
    if (!user && isDemoLoginEnabled && cleanEmail === demoAdminEmail && password === demoAdminPass) {
      user = {
        id: 'usr_admin_demo',
        name: 'Demo Administrator',
        email: demoAdminEmail,
        role: 'admin'
      };
    } else if (user) {
      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.'
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    // Sign JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'admin'
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful. Welcome to DisasterGuard Command Console.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'admin'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing authentication.'
    });
  }
});

router.post('/logout', (req, res) => {
  // Stateless JWT logout is handled on client by clearing stored token
  return res.status(200).json({
    success: true,
    message: 'Successfully logged out.'
  });
});

router.get('/me', requireAdmin, async (req, res) => {
  try {
    const user = await store.getUserById(req.user.id) || req.user;
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve current user session.'
    });
  }
});

module.exports = router;
