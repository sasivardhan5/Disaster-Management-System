const bcrypt = require('bcryptjs');

// Salt rounds for password hashing
const saltRounds = 10;
const defaultHashedPassword = bcrypt.hashSync('admin123', saltRounds);

const seedUsers = [
  {
    id: 'usr_admin_01',
    name: 'DisasterGuard Administrator',
    email: 'admin@disasterguard.org',
    password: defaultHashedPassword,
    role: 'admin',
    createdAt: new Date('2026-01-15T08:00:00Z').toISOString()
  }
];

const seedAlerts = [
  {
    id: 'ALT-2026-001',
    disasterType: 'Flood',
    severity: 'Critical',
    title: 'Riverfront Severe Inundation Alert',
    location: 'Riverside District, Sector 4 & 5',
    coordinates: { lat: 17.385044, lng: 78.486671 },
    description: 'Heavy precipitation has caused local river basin levels to exceed danger thresholds by 1.8 meters. Rapid water flow reported across low-lying crossings.',
    safetyInstructions: 'Move to elevated ground immediately. Disconnect primary electrical mains. Do not walk or drive through flowing water.',
    source: 'National Hydrological Agency (Demo)',
    status: 'Active',
    affectedPopulationEst: 15400,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'ALT-2026-002',
    disasterType: 'Cyclone',
    severity: 'High',
    title: 'Severe Coastal Windstorm Advisory',
    location: 'Eastern Maritime Belt & Harbor Zones',
    coordinates: { lat: 17.686816, lng: 83.218482 },
    description: 'Sustained winds between 85-110 km/h with heavy squalls expected along coastal belts over the next 18 hours. Potential tidal surges up to 2 meters.',
    safetyInstructions: 'Secure loose outdoor items. Stay indoors away from glass windows. Fishermen are strictly advised not to venture into deep sea.',
    source: 'Meteorological Observation Department (Demo)',
    status: 'Active',
    affectedPopulationEst: 42000,
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'ALT-2026-003',
    disasterType: 'Landslide',
    severity: 'Moderate',
    title: 'Slope Instability & Debris Flow Watch',
    location: 'Hillside Pass & Northern Valley Bypass',
    coordinates: { lat: 17.440081, lng: 78.348915 },
    description: 'Continuous moderate showers have saturated geological slopes along Highway 102. Minor rockfalls observed near kilometer marker 42.',
    safetyInstructions: 'Avoid non-essential transit through steep hill corridors. Watch for sudden cracking or unusual ground movement.',
    source: 'Geological Survey Rapid Unit (Demo)',
    status: 'Active',
    affectedPopulationEst: 3200,
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'ALT-2026-004',
    disasterType: 'Heatwave',
    severity: 'High',
    title: 'Extreme Temperature Advisory',
    location: 'Central Industrial Basin & Urban Core',
    coordinates: { lat: 17.4065, lng: 78.4772 },
    description: 'Daytime surface temperatures projected to reach 44.5°C with severe heat indices. High risk of heat exhaustion and sunstroke.',
    safetyInstructions: 'Stay hydrated with potable water. Avoid direct sun exposure between 11:30 AM and 4:00 PM. Keep vulnerable family members in cool spaces.',
    source: 'Regional Weather Center (Demo)',
    status: 'Active',
    affectedPopulationEst: 95000,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
  },
  {
    id: 'ALT-2026-005',
    disasterType: 'Fire',
    severity: 'Moderate',
    title: 'Commercial Zone Smoke Plume Warning',
    location: 'Old Market Storage Warehouse Strip',
    coordinates: { lat: 17.3616, lng: 78.4747 },
    description: 'Warehouse fire contained by fire crews; residual heavy smoke and reduced visibility persist within a 1.5 km radius.',
    safetyInstructions: 'Keep building windows closed. Wear N95 face masks if navigating adjacent streets. Yield right-of-way to emergency tenders.',
    source: 'Municipal Fire Brigade (Demo)',
    status: 'Resolved',
    affectedPopulationEst: 5000,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 'ALT-2026-006',
    disasterType: 'Earthquake',
    severity: 'Low',
    title: 'Minor Tremor Aftershock Surveillance',
    location: 'Southern Foothills Plateau',
    coordinates: { lat: 17.3200, lng: 78.5300 },
    description: 'Magnitude 3.2 minor subterranean tremor recorded at 12 km depth. No structural collapse reported; automated surveillance active.',
    safetyInstructions: 'Inspect home gas pipelines and electrical panels for stress fractures. Report any visible foundation cracks.',
    source: 'National Seismology Center (Demo)',
    status: 'Resolved',
    affectedPopulationEst: 12000,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  }
];

const seedIncidents = [
  {
    id: 'DG-2026-1001',
    incidentType: 'Flood',
    title: 'Waterlogging & Stranded Commuters at Metro Underpass',
    description: 'Stagnant stormwater reaching 3.5 feet depth beneath South Metro underpass. Two sedans disabled in middle lane; 6 occupants assisted to dry shoulder.',
    location: 'South Metro Underpass, Station Junction 7',
    coordinates: { lat: 17.3753, lng: 78.4812 },
    affectedCount: 15,
    urgencyLevel: 'High',
    status: 'Response Assigned',
    verificationState: 'Verified',
    reportedBy: 'K. Sharma (Citizen)',
    contactPhone: 'Confidential (Admin Only)',
    imageUrl: null,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'DG-2026-1002',
    incidentType: 'Road blockage',
    title: 'Fallen Ancient Banyan Tree Blocking Dual Carriageway',
    description: 'High wind gusts toppled a large roadside tree across both inbound lanes. Power cables snapped and resting across tarmac.',
    location: 'Grand Trunk Boulevard, Near Milestone 12',
    coordinates: { lat: 17.4125, lng: 78.4601 },
    affectedCount: 120,
    urgencyLevel: 'Moderate',
    status: 'Under Review',
    verificationState: 'Verified',
    reportedBy: 'A. Joseph (Local Resident)',
    contactPhone: 'Confidential (Admin Only)',
    imageUrl: null,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'DG-2026-1003',
    incidentType: 'Building damage',
    title: 'Partial Roof Collapse of Abandoned Storage Shed',
    description: 'Water-saturated corrugated roof gave way. No trapped casualties identified, but perimeter debris obstructs pedestrian pathway.',
    location: 'Old Port Road, Warehouse 3B',
    coordinates: { lat: 17.3912, lng: 78.4520 },
    affectedCount: 0,
    urgencyLevel: 'Low',
    status: 'Submitted',
    verificationState: 'Pending',
    reportedBy: 'R. Patel (Neighbor)',
    contactPhone: 'Confidential (Admin Only)',
    imageUrl: null,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: 'DG-2026-1004',
    incidentType: 'Medical emergency',
    title: 'Senior Citizen Dehydration & Heat Stroke Symptoms',
    description: 'Multiple elderly residents reporting severe dizziness and fainting spells at Community Center during midday peak heat.',
    location: 'Greenfield Senior Community Center',
    coordinates: { lat: 17.4285, lng: 78.4910 },
    affectedCount: 8,
    urgencyLevel: 'Critical',
    status: 'Response Assigned',
    verificationState: 'Verified',
    reportedBy: 'S. Rao (Community Volunteer)',
    contactPhone: 'Confidential (Admin Only)',
    imageUrl: null,
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: 'DG-2026-1005',
    incidentType: 'Fire',
    title: 'Transformer Spark & Dry Brush Flare-up',
    description: 'Distribution transformer arcing initiated a 50-meter dry grass fire along railway boundary fence. Local volunteers extinguished surface flames.',
    location: 'Railway Colony East Border',
    coordinates: { lat: 17.4510, lng: 78.5020 },
    affectedCount: 40,
    urgencyLevel: 'Moderate',
    status: 'Resolved',
    verificationState: 'Verified',
    reportedBy: 'V. Verma (Station Watchman)',
    contactPhone: 'Confidential (Admin Only)',
    imageUrl: null,
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  },
  {
    id: 'DG-2026-1006',
    incidentType: 'Cyclone',
    title: 'Coastal Tin Sheds Blown Away in Squall',
    description: 'Sudden gale blew sheet metal roofs into canal embankment. 4 fishing families displaced to nearby school veranda.',
    location: 'Fisherman Cove North Colony',
    coordinates: { lat: 17.3502, lng: 78.5215 },
    affectedCount: 16,
    urgencyLevel: 'High',
    status: 'Resolved',
    verificationState: 'Verified',
    reportedBy: 'M. Naidu (Council Member)',
    contactPhone: 'Confidential (Admin Only)',
    imageUrl: null,
    createdAt: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  }
];

const seedShelters = [
  {
    id: 'SHL-01',
    name: 'City Central Indoor Stadium Relief Complex',
    address: 'Stadium Way, Sector 2, Central Ward',
    coordinates: { lat: 17.3995, lng: 78.4735 },
    capacity: 650,
    availableBeds: 210,
    facilities: ['Drinking water', 'Food', 'Medical support', 'Accessible facilities', 'Sleeping arrangements', 'Power backup'],
    contactInfo: '+91 40 2345 6780 / shelter-central@disasterguard.demo',
    operationalStatus: 'Open',
    notes: 'Equipped with dedicated pediatric area and backup oxygen concentrators.',
    lastUpdated: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'SHL-02',
    name: 'St. Teresa Higher Secondary School Evacuation Hub',
    address: 'Hillview Avenue, North District',
    coordinates: { lat: 17.4320, lng: 78.4620 },
    capacity: 400,
    availableBeds: 85,
    facilities: ['Drinking water', 'Food', 'Sleeping arrangements', 'First-aid post'],
    contactInfo: '+91 40 2345 6781 / shelter-north@disasterguard.demo',
    operationalStatus: 'Open',
    notes: 'Hot meals served twice daily via regional relief partner kitchen.',
    lastUpdated: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'SHL-03',
    name: 'Community Center & Multipurpose Pavilion',
    address: '42 Lakeview Promenade, South Gate',
    coordinates: { lat: 17.3680, lng: 78.4910 },
    capacity: 250,
    availableBeds: 0,
    facilities: ['Drinking water', 'Food', 'Accessible facilities', 'Sleeping arrangements'],
    contactInfo: '+91 40 2345 6782',
    operationalStatus: 'Near Capacity',
    notes: 'Dormitory quarters full; emergency overflow cots awaiting delivery.',
    lastUpdated: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    id: 'SHL-04',
    name: 'Government Polytechnic Hostel Compound',
    address: 'Industrial Ring Road, West Suburb',
    coordinates: { lat: 17.4200, lng: 78.3800 },
    capacity: 500,
    availableBeds: 340,
    facilities: ['Drinking water', 'Food', 'Medical support', 'Accessible facilities', 'Sleeping arrangements'],
    contactInfo: '+91 40 2345 6783',
    operationalStatus: 'Open',
    notes: 'Primary intake center for western riverfront evacuees.',
    lastUpdated: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'SHL-05',
    name: 'Old Town Municipal Town Hall',
    address: 'Heritage Clocktower Square',
    coordinates: { lat: 17.3620, lng: 78.4720 },
    capacity: 200,
    availableBeds: 150,
    facilities: ['Drinking water', 'First-aid post'],
    contactInfo: '+91 40 2345 6784',
    operationalStatus: 'Preparing',
    notes: 'Currently undergoing sanitation sweep and bed setup.',
    lastUpdated: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  }
];

// Additional map locations for Hospitals and Emergency Services
const seedHospitals = [
  {
    id: 'HOSP-01',
    name: 'Metropolitan Government General Hospital (Trauma Center)',
    address: 'Hospital Road, Afzal Gunj',
    coordinates: { lat: 17.3768, lng: 78.4795 },
    category: 'Hospitals',
    capacity: '800 Beds',
    emergencyContact: '108 / +91 40 2460 0121',
    status: 'Operational 24/7',
    details: 'Equipped with 24/7 Level-1 Trauma response, ICU, burn ward, and emergency blood bank.'
  },
  {
    id: 'HOSP-02',
    name: 'Apollo District Emergency & Specialty Clinic',
    address: 'Jubilee Hills Road No. 72',
    coordinates: { lat: 17.4278, lng: 78.4112 },
    category: 'Hospitals',
    capacity: '350 Beds',
    emergencyContact: '1066 / +91 40 2360 7777',
    status: 'Operational 24/7',
    details: 'Advanced cardiac resuscitation, hyperbaric oxygen therapy, and pediatric urgent care.'
  },
  {
    id: 'HOSP-03',
    name: 'Nizam Emergency Care Institute',
    address: 'Panjagutta Main Crossing',
    coordinates: { lat: 17.4243, lng: 78.4526 },
    category: 'Hospitals',
    capacity: '500 Beds',
    emergencyContact: '+91 40 2348 9000',
    status: 'Operational 24/7',
    details: 'Regional public medical university hospital with mass casualty triage protocols.'
  }
];

const seedEmergencyServices = [
  {
    id: 'EMS-01',
    name: 'Central Fire & Disaster Rescue Command Headquarters',
    address: 'Secretariat Road, Fire Command Complex',
    coordinates: { lat: 17.4080, lng: 78.4710 },
    category: 'Emergency services',
    emergencyContact: '101 / 112',
    status: 'High Readiness',
    details: 'Equipped with heavy water bowsers, hydraulic cutters, rescue boats, and high-reach aerial ladders.'
  },
  {
    id: 'EMS-02',
    name: 'National Disaster Response Force (NDRF) Regional Outpost',
    address: 'Airfield North Sector, Gate 3',
    coordinates: { lat: 17.4530, lng: 78.4680 },
    category: 'Emergency services',
    emergencyContact: '1070 / +91 40 2790 3211',
    status: 'Deployed & On Standby',
    details: 'Specialized aquatic search and rescue units, canine search squads, and flood evacuation rafts.'
  },
  {
    id: 'EMS-03',
    name: 'State Disaster Emergency Operations Center (SEOC)',
    address: 'BRKR Government Complex, 4th Floor',
    coordinates: { lat: 17.4050, lng: 78.4840 },
    category: 'Emergency services',
    emergencyContact: '1070 (Toll Free)',
    status: 'Active Command Monitoring',
    details: 'Central coordination command center linking satellite radar, weather sensors, and municipal forces.'
  }
];

module.exports = {
  seedUsers,
  seedAlerts,
  seedIncidents,
  seedShelters,
  seedHospitals,
  seedEmergencyServices
};
