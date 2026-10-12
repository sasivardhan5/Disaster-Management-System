# DisasterGuard — Disaster Management System

**DisasterGuard** is a complete, modern, responsive, and functional full-stack web application designed for disaster awareness, real-time threat alert dissemination, interactive geospatial hazard mapping, citizen incident reporting, relief shelter tracking, and disaster preparedness training.

Built for college demonstrations, software engineering showcases, and emergency response simulations.

---

## 🌟 Key Features

1. **Home Command Dashboard**:
   - Dynamic real-time statistics counters (Active Alerts, Reported Incidents, Relief Shelters, Resolved Incidents).
   - Live alerts feed cards with visual severity indicators (Critical, High, Moderate, Low).
   - Quick emergency access to reporting, shelters, safety guides, and emergency hotlines.
   - Disaster preparedness summary cards for Floods, Cyclones, Earthquakes, and Fires.

2. **Disaster Alerts Feed (`alerts.html`)**:
   - Filter by disaster type, severity level, and operational status.
   - Instant search and sorting by newest, highest severity, or oldest.
   - Interactive detail modal with comprehensive situation briefings and required safety directives.

3. **Interactive Live Map (`map.html`)**:
   - Powered by **Leaflet.js** and **OpenStreetMap** tiles.
   - Color-coded pins for Active Disasters, Relief Shelters, Trauma Hospitals, and Emergency Services.
   - Interactive popups with coordinates, contact hotlines, and capacities.
   - Category filtering, map location search, and GPS "Locate Me" button with permission handling.

4. **Citizen Incident Reporting & Live Tracking (`report.html`)**:
   - Report form with categories (Flood, Cyclone, Earthquake, Fire, Landslide, Road blockage, Building damage, Medical emergency, Other).
   - One-click GPS auto-fill for exact coordinates.
   - Optional photo attachment with preview and server-side validation.
   - Duplicate submission protection with loading state.
   - Generates a unique tracking reference code (e.g., `DG-2026-1042`).
   - Built-in status tracker with a 5-step progress pipeline (*Submitted &rarr; Under Review &rarr; Verified &rarr; Response Assigned &rarr; Resolved*).

5. **Relief Shelters Directory (`shelters.html`)**:
   - Directory with real-time occupancy meters and available bed counts.
   - Facilities badges (Drinking water, Food, Medical support, Sleeping arrangements, Power backup).
   - Filter by facilities and operational status (*Open, Near Capacity, Preparing, Closed*).
   - "View on Map" links directly to the shelter's coordinates on the live interactive map.

6. **Disaster Safety Guides & Checklist (`safety.html`)**:
   - Complete guides for **Floods**, **Cyclones**, **Earthquakes**, **Fires**, **Landslides**, and **Heatwaves**.
   - Structured three-phase survival advice: **BEFORE** (Preparation), **DURING** (Immediate survival), and **AFTER** (Recovery).
   - Interactive 72-Hour Survival Go-Bag checklist stored in `localStorage` with a live completion progress bar.
   - One-click print-friendly layout.

7. **Admin Command Console (`admin.html` & `login.html`)**:
   - Protected by JWT authentication and bcrypt password hashing.
   - Real-time data visualizations powered by **Chart.js**:
     - Incidents by Category (Doughnut chart)
     - Incidents by Urgency (Bar chart)
     - Resolution Rate (Pie chart)
     - Incident Reports Timeline (Line chart)
   - Incident triage management: verify/reject citizen reports, adjust urgency levels, update response status, and delete demo records.
   - Alert management: broadcast new official advisories or resolve existing alerts.
   - Shelter management: register new evacuation centers and update bed capacity.

8. **Dual-Mode Storage Architecture**:
   - **MongoDB Mode**: Automatically connects to MongoDB via Mongoose if `MONGODB_URI` is provided.
   - **Local Demonstration Mode**: If MongoDB is not running or unconfigured, DisasterGuard automatically operates using persistent JSON file storage (`server/data/json/`). No external database installation is required to run the demo.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database / Data Layer**: Dual-mode (MongoDB with Mongoose OR File-based JSON Store with Auto-Persistence)
- **Mapping**: Leaflet.js (v1.9.4) & OpenStreetMap
- **Data Visualizations**: Chart.js (v4.x)
- **Typography & Icons**: Inter (Google Fonts) & Font Awesome 6.5.1
- **File Uploads**: Multer with strict MIME validation (JPG, PNG, WebP) and 5MB limit
- **Security**: JWT tokens, bcrypt password hashing, input sanitization, custom security headers, rate limiting

---

## 📁 Project Folder Structure

```
disasterguard/
│
├── public/                     # Static frontend client files
│   ├── index.html              # Home page with live dashboard stats
│   ├── alerts.html             # Disaster alerts directory & filters
│   ├── map.html                # Fullscreen Leaflet interactive map
│   ├── report.html             # Incident report form & ticket tracker
│   ├── shelters.html           # Relief shelters & occupancy meters
│   ├── safety.html             # Safety guides & interactive checklist
│   ├── about.html              # Architecture & prototype disclaimer
│   ├── login.html              # Administrator authentication
│   ├── admin.html              # Admin Command Console & Chart.js analytics
│   │
│   ├── css/
│   │   ├── style.css           # Design system, cards, badges & animations
│   │   └── responsive.css      # Smartphone & tablet responsive layouts
│   │
│   └── js/
│       ├── common.js           # Navigation, toasts & mobile menu
│       ├── main.js             # Home page live counters & alerts preview
│       ├── alerts.js           # Alerts filtering & detail modals
│       ├── map.js              # Leaflet initialization, markers & GPS
│       ├── report.js           # Form validation, GPS auto-fill & tracking
│       ├── shelters.js         # Shelters search, filter & map links
│       ├── safety.js           # 6 hazard guides & localStorage checklist
│       ├── auth.js             # Login submission & token storage
│       └── admin.js            # Admin CRUD, triage & Chart.js charts
│
├── server/                     # Backend server logic
│   ├── config/
│   │   └── db.js               # MongoDB connector with automatic fallback
│   ├── models/
│   │   ├── Alert.js            # Mongoose schema for alerts
│   │   ├── Incident.js         # Mongoose schema for incidents
│   │   ├── Shelter.js          # Mongoose schema for shelters
│   │   └── User.js             # Mongoose schema for users
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & admin guard
│   │   ├── upload.js           # Multer configuration for incident photos
│   │   └── rateLimiter.js      # Rate limiting against spam
│   ├── routes/
│   │   ├── authRoutes.js       # Login, logout & session profile endpoints
│   │   ├── alertRoutes.js      # Alerts CRUD & query filtering
│   │   ├── incidentRoutes.js   # Citizen reports & admin triage
│   │   ├── shelterRoutes.js    # Shelters CRUD & bed updates
│   │   ├── dashboardRoutes.js  # Live stats & Chart.js analytics metrics
│   │   └── mapRoutes.js        # Unified map coordinates & points of interest
│   └── data/
│       ├── seedData.js         # Initial sample datasets
│       ├── seedRunner.js       # Reseed script (npm run seed)
│       └── store.js            # Dual-mode repository layer
│
├── uploads/                    # Uploaded citizen incident photos
├── .env.example                # Sample environment variables
├── .env                        # Active environment configuration
├── .gitignore                  # Git exclusions
├── package.json                # Project dependencies and npm scripts
├── server.js                   # Main application entry point
└── README.md                   # Documentation and guide
```

---

## 🚀 Prerequisites

Before starting, ensure you have **Node.js** (v18 or newer) installed on your system.

To verify your Node.js and npm versions, run in Windows PowerShell:
```powershell
node -v
npm -v
```

---

## ⚡ Quick Start Instructions (Windows PowerShell)

### 1. Install Dependencies
In the project directory, run:
```powershell
npm install
```

### 2. Configure Environment Variables
A `.env` file is pre-configured with default demo settings. If you need to inspect or adjust it:
```powershell
Get-Content .env
```
Default configuration:
- `PORT=3000`
- `NODE_ENV=development`
- `JWT_SECRET=disasterguard_demo_jwt_secret_key_change_in_production_2026`
- `DEMO_ADMIN_EMAIL=admin@disasterguard.org`
- `DEMO_ADMIN_PASSWORD=admin123`
- `ENABLE_DEMO_LOGIN=true`

### 3. Start the Server
Run:
```powershell
npm start
```

### 4. Open in Your Browser
Visit:
```
http://localhost:3000
```

---

## 🔑 Administrator Credentials

To access the Admin Command Console (`http://localhost:3000/login.html`):

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@disasterguard.org` | `admin123` |

*(You can also click the **"Auto-Fill"** button on the login page to fill these credentials automatically.)*

---

## 🔄 Resetting / Re-seeding Demonstration Data

If you modify or delete records during testing and wish to restore the initial demo data, run:
```powershell
npm run seed
```
This resets all demo alerts, incidents, shelters, hospitals, and emergency services.

---

## 🗄️ Database Configuration

### Mode 1: Local Demonstration Mode (Default)
DisasterGuard runs immediately in **Local Demonstration Mode** without requiring MongoDB to be installed. Data is stored in JSON files under `server/data/json/` and persists across server restarts.

### Mode 2: MongoDB Mode (Optional)
If you have MongoDB installed locally or wish to connect to MongoDB Atlas:
1. Open `.env`.
2. Uncomment and configure `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/disasterguard
   ```
3. Restart the server with `npm start`. DisasterGuard will automatically seed the collections if they are empty.

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/login` — Sign in with email and password
- `POST /api/auth/logout` — End session
- `GET /api/auth/me` — Get authenticated admin profile

### Disaster Alerts
- `GET /api/alerts` — Retrieve all alerts (supports `?disasterType=...&severity=...&status=...&search=...&sort=...`)
- `GET /api/alerts/:id` — Get single alert detail
- `POST /api/alerts` — Create alert *(Admin only)*
- `PUT /api/alerts/:id` — Update alert *(Admin only)*
- `DELETE /api/alerts/:id` — Delete alert *(Admin only)*

### Citizen Incidents
- `GET /api/incidents` — List incident reports (public view sanitizes phone numbers; admin view includes full dossier)
- `GET /api/incidents/:id` — Look up single incident by reference ID (e.g. `DG-2026-1001`)
- `POST /api/incidents` — Submit a citizen incident report (supports multipart file upload)
- `PATCH /api/incidents/:id` — Update verification state, status, or urgency *(Admin only)*
- `DELETE /api/incidents/:id` — Delete incident record *(Admin only)*

### Relief Shelters
- `GET /api/shelters` — List shelters (supports `?facility=...&status=...&search=...`)
- `GET /api/shelters/:id` — Get shelter details
- `POST /api/shelters` — Register a new shelter *(Admin only)*
- `PUT /api/shelters/:id` — Update shelter info and bed capacity *(Admin only)*
- `DELETE /api/shelters/:id` — Remove shelter *(Admin only)*

### Analytics & Mapping
- `GET /api/dashboard/stats` — Real-time summary counts and storage mode status
- `GET /api/dashboard/analytics` — Category, urgency, resolution rate, and timeline metrics for Chart.js
- `GET /api/map/points` — Unified coordinates for all active disasters, shelters, hospitals, and emergency services

---

## ⚠️ Important Educational Prototype Disclaimer

> **DISCLAIMER**: DisasterGuard is an academic educational prototype developed for course demonstration and software engineering presentation.
> 
> The disaster alerts, incident tickets, shelter capacities, and hospital availability numbers displayed within this system are simulated sample records. In a real-world emergency situation, always dial official civil defense numbers (**112**, **108**, or **101**) immediately.
"# Disaster-Management-System" 
