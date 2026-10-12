const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/dashboard/stats - Real-time calculated application statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await store.getDashboardStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute dashboard metrics.'
    });
  }
});

// GET /api/dashboard/analytics - Breakdown for Chart.js dashboards
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await store.getDashboardAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute dashboard analytics.'
    });
  }
});

module.exports = router;
