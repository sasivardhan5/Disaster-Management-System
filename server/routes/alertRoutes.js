const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { requireAdmin } = require('../middleware/auth');

// GET /api/alerts - Public list of disaster alerts
router.get('/', async (req, res) => {
  try {
    const { disasterType, severity, status, search, sort } = req.query;
    let alerts = await store.getAlerts({ disasterType, severity, status, search });

    // Optional custom sorting
    if (sort === 'severity') {
      const severityOrder = { Critical: 4, High: 3, Moderate: 2, Low: 1 };
      alerts.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));
    } else if (sort === 'oldest') {
      alerts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // Default newest
      alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.status(200).json({
      success: true,
      count: alerts.length,
      isDemoData: true,
      disclaimer: 'Demonstration data only. This website does not currently provide verified live emergency warnings.',
      data: alerts
    });
  } catch (err) {
    console.error('Fetch alerts error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve disaster alerts.'
    });
  }
});

// GET /api/alerts/:id - Single alert detail
router.get('/:id', async (req, res) => {
  try {
    const alert = await store.getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: `Alert record with ID ${req.params.id} was not found.`
      });
    }

    return res.status(200).json({
      success: true,
      isDemoData: true,
      data: alert
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error looking up alert details.'
    });
  }
});

// POST /api/alerts - Create alert (Admin Only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { disasterType, severity, title, location, description, safetyInstructions, status, affectedPopulationEst, lat, lng } = req.body;

    if (!disasterType || !severity || !title || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: disasterType, severity, title, location, description.'
      });
    }

    const validTypes = ['Flood', 'Cyclone', 'Earthquake', 'Fire', 'Landslide', 'Heatwave', 'Other'];
    if (!validTypes.includes(disasterType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid disasterType. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const validSeverities = ['Low', 'Moderate', 'High', 'Critical'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: `Invalid severity. Must be one of: ${validSeverities.join(', ')}`
      });
    }

    const coordinates = {
      lat: (lat !== undefined && lat !== null && lat !== '') ? parseFloat(lat) : 17.385,
      lng: (lng !== undefined && lng !== null && lng !== '') ? parseFloat(lng) : 78.486
    };

    const created = await store.createAlert({
      disasterType,
      severity,
      title: title.trim(),
      location: location.trim(),
      coordinates,
      description: description.trim(),
      safetyInstructions: safetyInstructions ? safetyInstructions.trim() : 'Follow municipal emergency procedures.',
      source: 'DisasterGuard Emergency Command (Demo)',
      status: status || 'Active',
      affectedPopulationEst: affectedPopulationEst ? parseInt(affectedPopulationEst, 10) : 0
    });

    return res.status(201).json({
      success: true,
      message: 'New official alert registered successfully.',
      data: created
    });
  } catch (err) {
    console.error('Create alert error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create alert.'
    });
  }
});

// PUT /api/alerts/:id - Update alert (Admin Only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const alertId = req.params.id;
    const existing = await store.getAlertById(alertId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Alert ${alertId} not found.`
      });
    }

    const updates = { ...req.body };
    if (req.body.lat !== undefined && req.body.lng !== undefined) {
      updates.coordinates = {
        lat: parseFloat(req.body.lat),
        lng: parseFloat(req.body.lng)
      };
    }

    const updated = await store.updateAlert(alertId, updates);
    return res.status(200).json({
      success: true,
      message: `Alert ${alertId} successfully updated.`,
      data: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update alert.'
    });
  }
});

// DELETE /api/alerts/:id - Delete alert (Admin Only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const alertId = req.params.id;
    const deleted = await store.deleteAlert(alertId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Alert ${alertId} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Alert ${alertId} has been deleted.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete alert.'
    });
  }
});

module.exports = router;
