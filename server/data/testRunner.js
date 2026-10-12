// DisasterGuard Automated Verification Suite
const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.headers['content-type']?.includes('application/json') ? JSON.parse(body) : body
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      if (typeof data === 'string') {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting DisasterGuard Verification Tests ---');
  let token = null;

  // 1. Test Health endpoint
  const health = await request({ hostname: 'localhost', port: 3000, path: '/api/health', method: 'GET' });
  console.log(`[TEST 1] GET /api/health: Status ${health.statusCode} - System: ${health.body.system}`);
  if (health.statusCode !== 200) throw new Error('Health check failed');

  // 2. Test Stats
  const stats = await request({ hostname: 'localhost', port: 3000, path: '/api/dashboard/stats', method: 'GET' });
  console.log(`[TEST 2] GET /api/dashboard/stats: Status ${stats.statusCode} - Alerts: ${stats.body.data.activeAlerts}, Incidents: ${stats.body.data.totalIncidents}`);
  if (stats.statusCode !== 200) throw new Error('Stats endpoint failed');

  // 3. Test Alerts
  const alerts = await request({ hostname: 'localhost', port: 3000, path: '/api/alerts', method: 'GET' });
  console.log(`[TEST 3] GET /api/alerts: Status ${alerts.statusCode} - Count: ${alerts.body.count}`);
  if (alerts.statusCode !== 200 || alerts.body.count === 0) throw new Error('Alerts endpoint failed');

  // 4. Test Map Points
  const mapPoints = await request({ hostname: 'localhost', port: 3000, path: '/api/map/points', method: 'GET' });
  console.log(`[TEST 4] GET /api/map/points: Status ${mapPoints.statusCode} - Points: ${mapPoints.body.count}`);
  if (mapPoints.statusCode !== 200 || mapPoints.body.count === 0) throw new Error('Map points failed');

  // 5. Test Shelters
  const shelters = await request({ hostname: 'localhost', port: 3000, path: '/api/shelters', method: 'GET' });
  console.log(`[TEST 5] GET /api/shelters: Status ${shelters.statusCode} - Count: ${shelters.body.count}`);
  if (shelters.statusCode !== 200 || shelters.body.count === 0) throw new Error('Shelters failed');

  // 6. Test Incident Creation (Citizen report)
  const newIncidentPayload = {
    incidentType: 'Flood',
    title: 'Testing Automated Flash Flood Inundation Report',
    description: 'Automated test suite verification of the incident reporting pipeline.',
    location: 'North Lake Crossing, Sector 2',
    latitude: 17.4105,
    longitude: 78.4712,
    affectedCount: 5,
    urgencyLevel: 'High',
    reportedBy: 'QA Automated Tester'
  };
  const postInc = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/incidents',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, newIncidentPayload);
  console.log(`[TEST 6] POST /api/incidents: Status ${postInc.statusCode} - Ref ID: ${postInc.body.referenceId}`);
  if (postInc.statusCode !== 201 || !postInc.body.referenceId) throw new Error('Incident reporting failed');
  const createdRefId = postInc.body.referenceId;

  // 7. Test Incident Tracking Lookup by Reference ID
  const trackInc = await request({ hostname: 'localhost', port: 3000, path: `/api/incidents/${createdRefId}`, method: 'GET' });
  console.log(`[TEST 7] GET /api/incidents/${createdRefId}: Status ${trackInc.statusCode} - Status: ${trackInc.body.data.status}`);
  if (trackInc.statusCode !== 200 || trackInc.body.data.id !== createdRefId) throw new Error('Tracking lookup failed');

  // 8. Test Admin Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@disasterguard.org', password: 'admin123' });
  console.log(`[TEST 8] POST /api/auth/login: Status ${loginRes.statusCode} - User: ${loginRes.body.user.name}`);
  if (loginRes.statusCode !== 200 || !loginRes.body.token) throw new Error('Admin login failed');
  token = loginRes.body.token;

  // 9. Test Protected Admin Patch on Incident
  const patchInc = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/incidents/${createdRefId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, { verificationState: 'Verified', status: 'Response Assigned' });
  console.log(`[TEST 9] PATCH /api/incidents/${createdRefId} (Admin): Status ${patchInc.statusCode} - New Status: ${patchInc.body.data.status}`);
  if (patchInc.statusCode !== 200 || patchInc.body.data.verificationState !== 'Verified') throw new Error('Admin patch failed');

  // 10. Test HTML Static Page Deliveries
  const pages = ['index.html', 'alerts.html', 'map.html', 'report.html', 'shelters.html', 'safety.html', 'about.html', 'login.html', 'admin.html'];
  for (const page of pages) {
    const pageRes = await request({ hostname: 'localhost', port: 3000, path: `/${page}`, method: 'GET' });
    console.log(`[TEST 10] GET /${page}: Status ${pageRes.statusCode}`);
    if (pageRes.statusCode !== 200) throw new Error(`Failed to load ${page}`);
  }

  console.log('\n======================================================');
  console.log('✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY! (10/10)');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('❌ Verification test failed:', err);
  process.exit(1);
});
