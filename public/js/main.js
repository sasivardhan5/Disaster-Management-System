// DisasterGuard - Home Page Script

document.addEventListener('DOMContentLoaded', () => {
  loadLiveStats();
  loadFeaturedAlerts();
});

// Fetch & animate live statistics
async function loadLiveStats() {
  try {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) throw new Error('Could not fetch stats');
    const { data } = await res.json();

    animateCount('stat-active-alerts', data.activeAlerts || 0);
    animateCount('stat-reported-incidents', data.totalIncidents || 0);
    animateCount('stat-relief-shelters', data.totalShelters || 0);
    animateCount('stat-resolved-incidents', data.resolvedIncidents || 0);
  } catch (err) {
    console.warn('Failed to load stats, using fallback defaults:', err);
  }
}

function animateCount(elementId, targetValue) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let current = 0;
  const duration = 1200;
  const stepTime = 30;
  const steps = duration / stepTime;
  const increment = targetValue / steps;

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      el.textContent = targetValue;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, stepTime);
}

// Fetch active alerts for home page preview
async function loadFeaturedAlerts() {
  const container = document.getElementById('home-alerts-container');
  if (!container) return;

  try {
    const res = await fetch('/api/alerts?status=Active');
    const result = await res.json();
    const alerts = (result.data || []).slice(0, 3); // show top 3 active

    if (alerts.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 40px; background:#fff; border-radius:12px; border:1px solid #e2e8f0;">
          <i class="fas fa-check-circle" style="font-size:2.5rem; color:#16a34a; margin-bottom:12px;"></i>
          <h4 style="font-weight:700; color:#14243A;">No Critical Active Alerts At Present</h4>
          <p style="color:#64748B; font-size:0.9rem;">All monitored disaster parameters remain within safe baseline thresholds.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = alerts.map(alert => createAlertCardHTML(alert)).join('');

    // Attach click listeners for View Details modal
    container.querySelectorAll('.btn-view-alert').forEach(btn => {
      btn.addEventListener('click', () => {
        const alertId = btn.getAttribute('data-id');
        openAlertModal(alertId);
      });
    });
  } catch (err) {
    console.error('Error loading featured alerts:', err);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 30px; color:#ef4444;">
        <p>Could not connect to live alerts feed. Please check server connectivity.</p>
      </div>
    `;
  }
}

function createAlertCardHTML(alert) {
  const sevBadgeClass = `badge-${alert.severity.toLowerCase()}`;
  const iconMap = {
    Flood: 'fa-water',
    Cyclone: 'fa-wind',
    Earthquake: 'fa-house-crack',
    Fire: 'fa-fire',
    Landslide: 'fa-mountain',
    Heatwave: 'fa-sun',
    Other: 'fa-triangle-exclamation'
  };
  const icon = iconMap[alert.disasterType] || 'fa-triangle-exclamation';

  return `
    <div class="alert-card severity-${alert.severity}">
      <div class="alert-card-header">
        <div class="disaster-tag">
          <i class="fas ${icon} text-primary"></i> ${alert.disasterType}
        </div>
        <span class="badge ${sevBadgeClass}">
          <i class="fas fa-circle-exclamation"></i> ${alert.severity}
        </span>
      </div>
      <h3 class="alert-card-title">${escapeHTML(alert.title)}</h3>
      <div class="alert-card-location">
        <i class="fas fa-location-dot"></i> ${escapeHTML(alert.location)}
      </div>
      <p class="alert-card-desc">${escapeHTML(alert.description.length > 130 ? alert.description.substring(0, 130) + '...' : alert.description)}</p>
      <div class="alert-card-footer">
        <span><i class="far fa-clock"></i> ${formatDate(alert.createdAt)}</span>
        <button class="btn btn-secondary btn-sm btn-view-alert" data-id="${alert.id}">
          View Details <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;
}

// Modal for Alert Details
async function openAlertModal(alertId) {
  try {
    const res = await fetch(`/api/alerts/${alertId}`);
    const { data: alert } = await res.json();
    if (!alert) return;

    let modal = document.getElementById('alert-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'alert-detail-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="badge badge-${alert.severity.toLowerCase()}">${alert.severity}</span>
            <span style="font-size:0.85rem; color:#64748b; font-weight:600;">ID: ${alert.id}</span>
          </div>
          <button class="modal-close-btn" onclick="document.getElementById('alert-detail-modal').classList.remove('active')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <h2 style="font-size:1.35rem; font-weight:800; color:#14243A; margin-bottom:10px;">${escapeHTML(alert.title)}</h2>
          <div style="display:flex; gap:16px; font-size:0.85rem; color:#64748B; margin-bottom:16px; flex-wrap:wrap;">
            <span><i class="fas fa-location-dot text-danger"></i> ${escapeHTML(alert.location)}</span>
            <span><i class="fas fa-calendar-alt"></i> ${formatDate(alert.createdAt)}</span>
            <span><i class="fas fa-shield-halved"></i> Source: ${escapeHTML(alert.source)}</span>
          </div>
          <div style="background:#F8FAFC; border-radius:10px; padding:16px; border:1px solid #E2E8F0; margin-bottom:20px;">
            <h4 style="font-size:0.9rem; font-weight:700; color:#14243A; margin-bottom:6px;">Situation Overview</h4>
            <p style="font-size:0.9rem; color:#374151; line-height:1.55;">${escapeHTML(alert.description)}</p>
          </div>
          <div style="background:#EFF6FF; border-left:4px solid #2563EB; border-radius:6px; padding:16px; margin-bottom:16px;">
            <h4 style="font-size:0.9rem; font-weight:700; color:#1D4ED8; margin-bottom:6px;">
              <i class="fas fa-shield-check"></i> Recommended Safety Instructions
            </h4>
            <p style="font-size:0.88rem; color:#1E40AF; line-height:1.5;">${escapeHTML(alert.safetyInstructions)}</p>
          </div>
          <div style="font-size:0.75rem; color:#94A3B8; font-style:italic;">
            Notice: Simulated demonstration alert record for project testing.
          </div>
        </div>
        <div class="modal-footer">
          <a href="map.html" class="btn btn-primary btn-sm">
            <i class="fas fa-map-marked-alt"></i> Locate on Map
          </a>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('alert-detail-modal').classList.remove('active')">
            Close
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  } catch (e) {
    showToast('Failed to load alert details', 'error');
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
