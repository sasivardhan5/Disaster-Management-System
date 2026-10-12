const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { requireAdmin, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const rateLimiter = require('../middleware/rateLimiter');

// GET /api/incidents - List incidents (Sanitized for public, complete for Admin)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const isAdmin = Boolean(req.user && req.user.role === 'admin');
    const { incidentType, status, urgencyLevel, search } = req.query;

    const incidents = await store.getIncidents({ incidentType, status, urgencyLevel, search }, isAdmin);

    return res.status(200).json({
      success: true,
      count: incidents.length,
      isDemoData: true,
      isAdminView: isAdmin,
      data: incidents
    });
  } catch (err) {
    console.error('Fetch incidents error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve incident records.'
    });
  }
});

// GET /api/incidents/:id - Incident lookup by Reference ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const isAdmin = Boolean(req.user && req.user.role === 'admin');
    const incidentId = req.params.id;

    const incident = await store.getIncidentById(incidentId, isAdmin);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: `No incident report was found with reference ID "${incidentId}". Please verify the reference code.`
      });
    }

    return res.status(200).json({
      success: true,
      isDemoData: true,
      data: incident
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error searching incident by reference ID.'
    });
  }
});

// POST /api/incidents - Citizen / Public Incident Reporting
router.post(
  '/',
  rateLimiter({ windowMs: 60 * 1000, max: 20, message: 'Too many reports submitted from this IP. Please wait a minute.' }),
  (req, res, next) => {
    upload.single('image')(req, res, err => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error. Please provide a valid JPG, PNG, or WebP under 5MB.'
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const {
        incidentType,
        title,
        description,
        location,
        latitude,
        longitude,
        affectedCount,
        urgencyLevel,
        reportedBy,
        contactPhone
      } = req.body;

      // Validation
      if (!incidentType || !title || !description || !location) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields: incident type, title, description, and location.'
        });
      }

      const validTypes = [
        'Flood',
        'Cyclone',
        'Earthquake',
        'Fire',
        'Landslide',
        'Road blockage',
        'Building damage',
        'Medical emergency',
        'Other'
      ];
      if (!validTypes.includes(incidentType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid incident category. Must be one of: ${validTypes.join(', ')}`
        });
      }

      // Validate coordinates if provided
      let lat = null;
      let lng = null;
      if (latitude !== undefined && latitude !== '' && latitude !== null) {
        const parsedLat = parseFloat(latitude);
        if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
          return res.status(400).json({
            success: false,
            message: 'Latitude must be a valid number between -90 and +90 degrees.'
          });
        }
        lat = parsedLat;
      }

      if (longitude !== undefined && longitude !== '' && longitude !== null) {
        const parsedLng = parseFloat(longitude);
        if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
          return res.status(400).json({
            success: false,
            message: 'Longitude must be a valid number between -180 and +180 degrees.'
          });
        }
        lng = parsedLng;
      }

      // Validate affected count
      let affected = 1;
      if (affectedCount !== undefined && affectedCount !== '') {
        affected = parseInt(affectedCount, 10);
        if (isNaN(affected) || affected < 0) {
          return res.status(400).json({
            success: false,
            message: 'Affected people count must be a non-negative number.'
          });
        }
      }

      const validUrgencies = ['Low', 'Moderate', 'High', 'Critical'];
      const urgency = validUrgencies.includes(urgencyLevel) ? urgencyLevel : 'Moderate';

      let imageUrl = null;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const created = await store.createIncident({
        incidentType,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        coordinates: { lat, lng },
        affectedCount: affected,
        urgencyLevel: urgency,
        reportedBy: reportedBy ? reportedBy.trim() : 'Anonymous Citizen',
        contactPhone: contactPhone ? contactPhone.trim() : null,
        imageUrl
      });

      return res.status(201).json({
        success: true,
        message: 'Incident report submitted successfully. An emergency review ticket has been logged.',
        referenceId: created.id,
        isDemoData: true,
        data: store.sanitizeIncident(created, false)
      });
    } catch (err) {
      console.error('Incident report submission error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to process incident report submission.'
      });
    }
  }
);

// PATCH /api/incidents/:id - Admin updates status / verification / urgency
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const incidentId = req.params.id;
    const existing = await store.getIncidentById(incidentId, true);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Incident ${incidentId} not found.`
      });
    }

    const { status, verificationState, urgencyLevel, adminNotes } = req.body;
    const updates = {};

    if (status) {
      const allowedStatus = ['Submitted', 'Under Review', 'Verified', 'Response Assigned', 'Resolved'];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${allowedStatus.join(', ')}`
        });
      }
      updates.status = status;
    }

    if (verificationState) {
      const allowedStates = ['Pending', 'Verified', 'Rejected'];
      if (!allowedStates.includes(verificationState)) {
        return res.status(400).json({
          success: false,
          message: `Invalid verification state. Must be one of: ${allowedStates.join(', ')}`
        });
      }
      updates.verificationState = verificationState;
    }

    if (urgencyLevel) {
      const allowedUrgencies = ['Low', 'Moderate', 'High', 'Critical'];
      if (!allowedUrgencies.includes(urgencyLevel)) {
        return res.status(400).json({
          success: false,
          message: `Invalid urgency level. Must be one of: ${allowedUrgencies.join(', ')}`
        });
      }
      updates.urgencyLevel = urgencyLevel;
    }

    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
    }

    const updated = await store.updateIncident(incidentId, updates);

    return res.status(200).json({
      success: true,
      message: `Incident ${incidentId} updated successfully.`,
      data: updated
    });
  } catch (err) {
    console.error('Update incident error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update incident record.'
    });
  }
});

// DELETE /api/incidents/:id - Admin removes demonstration incident
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const incidentId = req.params.id;
    const deleted = await store.deleteIncident(incidentId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Incident ${incidentId} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Incident record ${incidentId} was deleted successfully.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete incident.'
    });
  }
});

module.exports = router;
