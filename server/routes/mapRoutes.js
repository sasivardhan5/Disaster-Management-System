const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/map/points - Unified collection of map points across all categories
router.get('/points', async (req, res) => {
  try {
    const points = await store.getMapPoints();
    return res.status(200).json({
      success: true,
      count: points.length,
      isDemoData: true,
      disclaimer: 'Demonstration coordinates only. Markers do not represent verified real-world emergency incidents or actual operational facilities.',
      data: points
    });
  } catch (err) {
    console.error('Map points error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve interactive map coordinates.'
    });
  }
});

module.exports = router;
