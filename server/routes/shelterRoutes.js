const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { requireAdmin } = require('../middleware/auth');

// GET /api/shelters - List relief shelters
router.get('/', async (req, res) => {
  try {
    const { status, facility, search } = req.query;
    const shelters = await store.getShelters({ status, facility, search });

    return res.status(200).json({
      success: true,
      count: shelters.length,
      isDemoData: true,
      data: shelters
    });
  } catch (err) {
    console.error('Fetch shelters error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve relief shelters.'
    });
  }
});

// GET /api/shelters/:id - Specific shelter details
router.get('/:id', async (req, res) => {
  try {
    const shelter = await store.getShelterById(req.params.id);
    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: `Relief shelter ${req.params.id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      isDemoData: true,
      data: shelter
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error looking up shelter details.'
    });
  }
});

// POST /api/shelters - Create shelter (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, address, capacity, availableBeds, facilities, contactInfo, operationalStatus, notes, lat, lng } = req.body;

    if (!name || !address || capacity === undefined || capacity === '') {
      return res.status(400).json({
        success: false,
        message: 'Name, address, and capacity are required fields.'
      });
    }

    const coordinates = {
      lat: (lat !== undefined && lat !== null && lat !== '') ? parseFloat(lat) : 17.39,
      lng: (lng !== undefined && lng !== null && lng !== '') ? parseFloat(lng) : 78.48
    };

    const created = await store.createShelter({
      name: name.trim(),
      address: address.trim(),
      coordinates,
      capacity: parseInt(capacity, 10),
      availableBeds: availableBeds !== undefined && availableBeds !== '' ? parseInt(availableBeds, 10) : null,
      facilities,
      contactInfo: contactInfo ? contactInfo.trim() : 'Emergency Operations Desk',
      operationalStatus: operationalStatus || 'Open',
      notes: notes || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Relief shelter registered successfully.',
      data: created
    });
  } catch (err) {
    console.error('Create shelter error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create relief shelter.'
    });
  }
});

// PUT /api/shelters/:id - Update shelter (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const shelterId = req.params.id;
    const existing = await store.getShelterById(shelterId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Shelter ${shelterId} not found.`
      });
    }

    const updates = { ...req.body };
    if (req.body.lat !== undefined && req.body.lng !== undefined) {
      updates.coordinates = {
        lat: parseFloat(req.body.lat),
        lng: parseFloat(req.body.lng)
      };
    }

    const updated = await store.updateShelter(shelterId, updates);

    return res.status(200).json({
      success: true,
      message: `Shelter ${shelterId} updated successfully.`,
      data: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update shelter record.'
    });
  }
});

// DELETE /api/shelters/:id - Delete shelter (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const shelterId = req.params.id;
    const deleted = await store.deleteShelter(shelterId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Shelter ${shelterId} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Shelter ${shelterId} was successfully removed.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete shelter.'
    });
  }
});

module.exports = router;
