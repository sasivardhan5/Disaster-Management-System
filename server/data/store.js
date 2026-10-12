const fs = require('fs');
const path = require('path');
const { seedUsers, seedAlerts, seedIncidents, seedShelters, seedHospitals, seedEmergencyServices } = require('./seedData');

// Mongoose Models
const User = require('../models/User');
const Alert = require('../models/Alert');
const Incident = require('../models/Incident');
const Shelter = require('../models/Shelter');

class DataStore {
  constructor() {
    this.mode = 'local-json'; // 'mongodb' or 'local-json'
    this.jsonDir = path.join(__dirname, 'json');
    this.initialized = false;
  }

  async init(useMongoDB = false) {
    if (useMongoDB) {
      try {
        this.mode = 'mongodb';
        await this.seedMongoDBIfEmpty();
        this.initialized = true;
        console.log('[DisasterGuard Store] Operating in MongoDB mode.');
        return;
      } catch (err) {
        console.warn('[DisasterGuard Store] Error initializing MongoDB models, falling back to JSON:', err.message);
        this.mode = 'local-json';
      }
    }

    this.mode = 'local-json';
    this.ensureJsonFiles();
    this.initialized = true;
    console.log('[DisasterGuard Store] Operating in Local Demonstration File Storage mode.');
  }

  getStorageMode() {
    return {
      mode: this.mode,
      isDemo: this.mode === 'local-json',
      description: this.mode === 'mongodb' 
        ? 'Connected to Live MongoDB Database' 
        : 'Local Demonstration Mode (File-based JSON Store with Auto-Persistence)'
    };
  }

  // --- JSON File Helpers ---
  ensureJsonFiles() {
    if (!fs.existsSync(this.jsonDir)) {
      fs.mkdirSync(this.jsonDir, { recursive: true });
    }

    const files = [
      { name: 'users.json', seed: seedUsers },
      { name: 'alerts.json', seed: seedAlerts },
      { name: 'incidents.json', seed: seedIncidents },
      { name: 'shelters.json', seed: seedShelters },
      { name: 'hospitals.json', seed: seedHospitals },
      { name: 'emergencyServices.json', seed: seedEmergencyServices }
    ];

    for (const f of files) {
      const filePath = path.join(this.jsonDir, f.name);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(f.seed, null, 2), 'utf8');
      }
    }
  }

  readJson(filename) {
    try {
      const filePath = path.join(this.jsonDir, filename);
      if (!fs.existsSync(filePath)) {
        this.ensureJsonFiles();
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      console.error(`Error reading ${filename}:`, e.message);
      return [];
    }
  }

  writeJson(filename, data) {
    try {
      const filePath = path.join(this.jsonDir, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error(`Error writing ${filename}:`, e.message);
      return false;
    }
  }

  // --- Seed MongoDB If Empty ---
  async seedMongoDBIfEmpty() {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[DisasterGuard Store] Seeding initial data into MongoDB...');
      await User.insertMany(seedUsers);
      await Alert.insertMany(seedAlerts);
      await Incident.insertMany(seedIncidents);
      await Shelter.insertMany(seedShelters);
      console.log('[DisasterGuard Store] MongoDB seeding completed successfully.');
    }
  }

  // --- USER OPERATIONS ---
  async getUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (this.mode === 'mongodb') {
      return await User.findOne({ email: cleanEmail }).lean();
    } else {
      const users = this.readJson('users.json');
      return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
    }
  }

  async getUserById(id) {
    if (this.mode === 'mongodb') {
      return await User.findOne({ id }).select('-password').lean();
    } else {
      const users = this.readJson('users.json');
      const user = users.find(u => u.id === id);
      if (user) {
        const { password, ...safeUser } = user;
        return safeUser;
      }
      return null;
    }
  }

  // --- ALERT OPERATIONS ---
  async getAlerts(filters = {}) {
    if (this.mode === 'mongodb') {
      const query = {};
      if (filters.disasterType && filters.disasterType !== 'All') {
        query.disasterType = filters.disasterType;
      }
      if (filters.severity && filters.severity !== 'All') {
        query.severity = filters.severity;
      }
      if (filters.status && filters.status !== 'All') {
        query.status = filters.status;
      }
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { location: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }
      return await Alert.find(query).sort({ createdAt: -1 }).lean();
    } else {
      let alerts = this.readJson('alerts.json');
      if (filters.disasterType && filters.disasterType !== 'All') {
        alerts = alerts.filter(a => a.disasterType.toLowerCase() === filters.disasterType.toLowerCase());
      }
      if (filters.severity && filters.severity !== 'All') {
        alerts = alerts.filter(a => a.severity.toLowerCase() === filters.severity.toLowerCase());
      }
      if (filters.status && filters.status !== 'All') {
        alerts = alerts.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
      }
      if (filters.search) {
        const term = filters.search.toLowerCase();
        alerts = alerts.filter(a => 
          (a.title && a.title.toLowerCase().includes(term)) ||
          (a.location && a.location.toLowerCase().includes(term)) ||
          (a.description && a.description.toLowerCase().includes(term))
        );
      }
      // Sort newest first
      alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return alerts;
    }
  }

  async getAlertById(id) {
    if (this.mode === 'mongodb') {
      return await Alert.findOne({ id }).lean();
    } else {
      const alerts = this.readJson('alerts.json');
      return alerts.find(a => a.id === id) || null;
    }
  }

  async createAlert(data) {
    const nextId = `ALT-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const newAlert = {
      id: nextId,
      disasterType: data.disasterType || 'Other',
      severity: data.severity || 'Moderate',
      title: data.title,
      location: data.location,
      coordinates: data.coordinates || { lat: 17.385, lng: 78.486 },
      description: data.description,
      safetyInstructions: data.safetyInstructions || 'Follow official regional safety instructions.',
      source: data.source || 'DisasterGuard Emergency Operations (Demo)',
      status: data.status || 'Active',
      affectedPopulationEst: Number(data.affectedPopulationEst) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.mode === 'mongodb') {
      const doc = new Alert(newAlert);
      return (await doc.save()).toObject();
    } else {
      const alerts = this.readJson('alerts.json');
      alerts.unshift(newAlert);
      this.writeJson('alerts.json', alerts);
      return newAlert;
    }
  }

  async updateAlert(id, updates) {
    const updatedAt = new Date().toISOString();
    if (this.mode === 'mongodb') {
      return await Alert.findOneAndUpdate({ id }, { ...updates, updatedAt }, { new: true }).lean();
    } else {
      const alerts = this.readJson('alerts.json');
      const idx = alerts.findIndex(a => a.id === id);
      if (idx === -1) return null;
      alerts[idx] = { ...alerts[idx], ...updates, updatedAt };
      this.writeJson('alerts.json', alerts);
      return alerts[idx];
    }
  }

  async deleteAlert(id) {
    if (this.mode === 'mongodb') {
      const res = await Alert.deleteOne({ id });
      return res.deletedCount > 0;
    } else {
      let alerts = this.readJson('alerts.json');
      const initLen = alerts.length;
      alerts = alerts.filter(a => a.id !== id);
      if (alerts.length < initLen) {
        this.writeJson('alerts.json', alerts);
        return true;
      }
      return false;
    }
  }

  // --- INCIDENT OPERATIONS ---
  sanitizeIncident(incident, isAdmin = false) {
    if (!incident) return null;
    const clone = { ...incident };
    if (!isAdmin) {
      delete clone.contactPhone;
      delete clone.adminNotes;
    }
    return clone;
  }

  async getIncidents(filters = {}, isAdmin = false) {
    let incidents = [];
    if (this.mode === 'mongodb') {
      const query = {};
      if (filters.incidentType && filters.incidentType !== 'All') {
        query.incidentType = filters.incidentType;
      }
      if (filters.status && filters.status !== 'All') {
        query.status = filters.status;
      }
      if (filters.urgencyLevel && filters.urgencyLevel !== 'All') {
        query.urgencyLevel = filters.urgencyLevel;
      }
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { location: { $regex: filters.search, $options: 'i' } },
          { id: { $regex: filters.search, $options: 'i' } }
        ];
      }
      const raw = await Incident.find(query).sort({ createdAt: -1 }).lean();
      incidents = raw.map(i => this.sanitizeIncident(i, isAdmin));
    } else {
      let all = this.readJson('incidents.json');
      if (filters.incidentType && filters.incidentType !== 'All') {
        all = all.filter(i => i.incidentType.toLowerCase() === filters.incidentType.toLowerCase());
      }
      if (filters.status && filters.status !== 'All') {
        all = all.filter(i => i.status.toLowerCase() === filters.status.toLowerCase());
      }
      if (filters.urgencyLevel && filters.urgencyLevel !== 'All') {
        all = all.filter(i => i.urgencyLevel.toLowerCase() === filters.urgencyLevel.toLowerCase());
      }
      if (filters.search) {
        const term = filters.search.toLowerCase();
        all = all.filter(i =>
          (i.title && i.title.toLowerCase().includes(term)) ||
          (i.location && i.location.toLowerCase().includes(term)) ||
          (i.id && i.id.toLowerCase().includes(term))
        );
      }
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      incidents = all.map(i => this.sanitizeIncident(i, isAdmin));
    }
    return incidents;
  }

  async getIncidentById(id, isAdmin = false) {
    if (this.mode === 'mongodb') {
      const doc = await Incident.findOne({ id }).lean();
      return this.sanitizeIncident(doc, isAdmin);
    } else {
      const incidents = this.readJson('incidents.json');
      const found = incidents.find(i => i.id.toLowerCase() === id.toLowerCase());
      return this.sanitizeIncident(found, isAdmin);
    }
  }

  async createIncident(data) {
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const incidentId = `DG-${year}-${randomSeq}`;

    const newIncident = {
      id: incidentId,
      incidentType: data.incidentType || 'Other',
      title: data.title,
      description: data.description,
      location: data.location,
      coordinates: data.coordinates || { lat: null, lng: null },
      affectedCount: Number(data.affectedCount) || 1,
      urgencyLevel: data.urgencyLevel || 'Moderate',
      status: 'Submitted',
      verificationState: 'Pending',
      reportedBy: data.reportedBy || 'Anonymous Citizen',
      contactPhone: data.contactPhone || null,
      imageUrl: data.imageUrl || null,
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.mode === 'mongodb') {
      const doc = new Incident(newIncident);
      return (await doc.save()).toObject();
    } else {
      const incidents = this.readJson('incidents.json');
      incidents.unshift(newIncident);
      this.writeJson('incidents.json', incidents);
      return newIncident;
    }
  }

  async updateIncident(id, updates) {
    const updatedAt = new Date().toISOString();
    if (this.mode === 'mongodb') {
      return await Incident.findOneAndUpdate({ id }, { ...updates, updatedAt }, { new: true }).lean();
    } else {
      const incidents = this.readJson('incidents.json');
      const idx = incidents.findIndex(i => i.id.toLowerCase() === id.toLowerCase());
      if (idx === -1) return null;
      incidents[idx] = { ...incidents[idx], ...updates, updatedAt };
      this.writeJson('incidents.json', incidents);
      return incidents[idx];
    }
  }

  async deleteIncident(id) {
    if (this.mode === 'mongodb') {
      const res = await Incident.deleteOne({ id });
      return res.deletedCount > 0;
    } else {
      let incidents = this.readJson('incidents.json');
      const initLen = incidents.length;
      incidents = incidents.filter(i => i.id.toLowerCase() !== id.toLowerCase());
      if (incidents.length < initLen) {
        this.writeJson('incidents.json', incidents);
        return true;
      }
      return false;
    }
  }

  // --- SHELTER OPERATIONS ---
  async getShelters(filters = {}) {
    let shelters = [];
    if (this.mode === 'mongodb') {
      const query = {};
      if (filters.status && filters.status !== 'All') {
        query.operationalStatus = filters.status;
      }
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { address: { $regex: filters.search, $options: 'i' } }
        ];
      }
      shelters = await Shelter.find(query).sort({ capacity: -1 }).lean();
    } else {
      shelters = this.readJson('shelters.json');
      if (filters.status && filters.status !== 'All') {
        shelters = shelters.filter(s => s.operationalStatus.toLowerCase() === filters.status.toLowerCase());
      }
      if (filters.search) {
        const term = filters.search.toLowerCase();
        shelters = shelters.filter(s =>
          (s.name && s.name.toLowerCase().includes(term)) ||
          (s.address && s.address.toLowerCase().includes(term))
        );
      }
    }

    if (filters.facility && filters.facility !== 'All') {
      const term = filters.facility.toLowerCase();
      shelters = shelters.filter(s => Array.isArray(s.facilities) && s.facilities.some(f => f.toLowerCase().includes(term)));
    }

    return shelters;
  }

  async getShelterById(id) {
    if (this.mode === 'mongodb') {
      return await Shelter.findOne({ id }).lean();
    } else {
      const shelters = this.readJson('shelters.json');
      return shelters.find(s => s.id === id) || null;
    }
  }

  async createShelter(data) {
    const count = (await this.getShelters()).length + 1;
    const nextId = `SHL-0${count}`;
    const newShelter = {
      id: nextId,
      name: data.name,
      address: data.address,
      coordinates: data.coordinates || { lat: 17.39, lng: 78.48 },
      capacity: Number(data.capacity) || 100,
      availableBeds: data.availableBeds !== undefined && data.availableBeds !== '' ? Number(data.availableBeds) : null,
      facilities: Array.isArray(data.facilities) ? data.facilities : (data.facilities ? data.facilities.split(',').map(f => f.trim()) : ['Drinking water']),
      contactInfo: data.contactInfo || 'Emergency Shelter Desk',
      operationalStatus: data.operationalStatus || 'Open',
      notes: data.notes || '',
      lastUpdated: new Date().toISOString()
    };

    if (this.mode === 'mongodb') {
      const doc = new Shelter(newShelter);
      return (await doc.save()).toObject();
    } else {
      const shelters = this.readJson('shelters.json');
      shelters.push(newShelter);
      this.writeJson('shelters.json', shelters);
      return newShelter;
    }
  }

  async updateShelter(id, updates) {
    const lastUpdated = new Date().toISOString();
    if (updates.capacity !== undefined) updates.capacity = Number(updates.capacity);
    if (updates.availableBeds !== undefined && updates.availableBeds !== '') {
      updates.availableBeds = Number(updates.availableBeds);
    }
    if (typeof updates.facilities === 'string') {
      updates.facilities = updates.facilities.split(',').map(f => f.trim()).filter(Boolean);
    }

    if (this.mode === 'mongodb') {
      return await Shelter.findOneAndUpdate({ id }, { ...updates, lastUpdated }, { new: true }).lean();
    } else {
      const shelters = this.readJson('shelters.json');
      const idx = shelters.findIndex(s => s.id === id);
      if (idx === -1) return null;
      shelters[idx] = { ...shelters[idx], ...updates, lastUpdated };
      this.writeJson('shelters.json', shelters);
      return shelters[idx];
    }
  }

  async deleteShelter(id) {
    if (this.mode === 'mongodb') {
      const res = await Shelter.deleteOne({ id });
      return res.deletedCount > 0;
    } else {
      let shelters = this.readJson('shelters.json');
      const initLen = shelters.length;
      shelters = shelters.filter(s => s.id !== id);
      if (shelters.length < initLen) {
        this.writeJson('shelters.json', shelters);
        return true;
      }
      return false;
    }
  }

  // --- MAP POINTS ---
  async getMapPoints() {
    const [alerts, incidents, shelters] = await Promise.all([
      this.getAlerts({ status: 'Active' }),
      this.getIncidents({}, false),
      this.getShelters({})
    ]);

    const hospitals = this.readJson('hospitals.json');
    const emergencyServices = this.readJson('emergencyServices.json');

    const points = [];

    // Map active alerts
    for (const a of alerts) {
      if (a.coordinates && a.coordinates.lat && a.coordinates.lng) {
        points.push({
          id: a.id,
          category: 'Disasters',
          subType: a.disasterType,
          title: a.title,
          location: a.location,
          severity: a.severity,
          status: a.status,
          description: a.description,
          lat: a.coordinates.lat,
          lng: a.coordinates.lng,
          link: `alerts.html#${a.id}`
        });
      }
    }

    // Map verified or response-assigned incidents
    for (const inc of incidents) {
      if (inc.coordinates && inc.coordinates.lat && inc.coordinates.lng) {
        points.push({
          id: inc.id,
          category: 'Incidents',
          subType: inc.incidentType,
          title: inc.title,
          location: inc.location,
          severity: inc.urgencyLevel,
          status: inc.status,
          description: inc.description,
          lat: inc.coordinates.lat,
          lng: inc.coordinates.lng,
          affectedCount: inc.affectedCount
        });
      }
    }

    // Map shelters
    for (const s of shelters) {
      if (s.coordinates && s.coordinates.lat && s.coordinates.lng) {
        points.push({
          id: s.id,
          category: 'Shelters',
          subType: 'Relief Center',
          title: s.name,
          location: s.address,
          status: s.operationalStatus,
          capacity: s.capacity,
          availableBeds: s.availableBeds,
          facilities: s.facilities,
          lat: s.coordinates.lat,
          lng: s.coordinates.lng,
          link: `shelters.html#${s.id}`
        });
      }
    }

    // Map Hospitals
    for (const h of hospitals) {
      points.push({
        id: h.id,
        category: 'Hospitals',
        subType: 'Medical Center',
        title: h.name,
        location: h.address,
        status: h.status,
        emergencyContact: h.emergencyContact,
        description: h.details,
        lat: h.coordinates.lat,
        lng: h.coordinates.lng
      });
    }

    // Map Emergency Services
    for (const es of emergencyServices) {
      points.push({
        id: es.id,
        category: 'Emergency services',
        subType: 'Rescue Station',
        title: es.name,
        location: es.address,
        status: es.status,
        emergencyContact: es.emergencyContact,
        description: es.details,
        lat: es.coordinates.lat,
        lng: es.coordinates.lng
      });
    }

    return points;
  }

  // --- DASHBOARD STATS & ANALYTICS ---
  async getDashboardStats() {
    const [allAlerts, allIncidents, allShelters] = await Promise.all([
      this.getAlerts({}),
      this.getIncidents({}, true),
      this.getShelters({})
    ]);

    const activeAlerts = allAlerts.filter(a => a.status === 'Active').length;
    const totalIncidents = allIncidents.length;
    const pendingReports = allIncidents.filter(i => i.status === 'Submitted' || i.verificationState === 'Pending').length;
    const resolvedIncidents = allIncidents.filter(i => i.status === 'Resolved').length;
    const totalShelters = allShelters.length;
    const openShelters = allShelters.filter(s => s.operationalStatus === 'Open').length;

    // Total affected count
    const totalAffectedSum = allIncidents.reduce((acc, curr) => acc + (Number(curr.affectedCount) || 0), 0);

    return {
      activeAlerts,
      totalIncidents,
      pendingReports,
      resolvedIncidents,
      totalShelters,
      openShelters,
      totalAffectedSum,
      storageMode: this.getStorageMode()
    };
  }

  async getDashboardAnalytics() {
    const incidents = await this.getIncidents({}, true);

    // 1. Incidents by category
    const byCategory = {};
    // 2. Incidents by urgency/severity
    const bySeverity = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
    // 3. Status breakdown
    let resolvedCount = 0;
    let unresolvedCount = 0;

    for (const inc of incidents) {
      // Category
      const cat = inc.incidentType || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;

      // Severity
      const sev = inc.urgencyLevel || 'Moderate';
      if (bySeverity[sev] !== undefined) {
        bySeverity[sev]++;
      } else {
        bySeverity['Moderate']++;
      }

      // Status
      if (inc.status === 'Resolved') {
        resolvedCount++;
      } else {
        unresolvedCount++;
      }
    }

    // 4. Incident timeline (last 6 months or demo distribution)
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const timelineData = [3, 5, 8, 12, 9, incidents.length];

    return {
      byCategory,
      bySeverity,
      statusBreakdown: {
        resolved: resolvedCount,
        unresolved: unresolvedCount
      },
      timeline: {
        labels: months,
        counts: timelineData
      }
    };
  }
}

// Export singleton instance
const store = new DataStore();
module.exports = store;
