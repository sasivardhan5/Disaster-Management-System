// DisasterGuard - Disaster Alerts Page Script

let allAlerts = [];

document.addEventListener('DOMContentLoaded', () => {
  initAlertFilters();
  loadAlerts();
});

function initAlertFilters() {
  const searchInput = document.getElementById('alert-search');
  const typeFilter = document.getElementById('filter-type');
  const severityFilter = document.getElementById('filter-severity');
  const statusFilter = document.getElementById('filter-status');
  const sortFilter = document.getElementById('filter-sort');

  const triggerFetch = () => loadAlerts();

  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(triggerFetch, 250);
    });
  }

  if (typeFilter) typeFilter.addEventListener('change', triggerFetch);
  if (severityFilter) severityFilter.addEventListener('change', triggerFetch);
  if (statusFilter) statusFilter.addEventListener('change', triggerFetch);
  if (sortFilter) sortFilter.addEventListener('change', triggerFetch);

  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (typeFilter) typeFilter.value = 'All';
      if (severityFilter) severityFilter.value = 'All';
      if (statusFilter) statusFilter.value = 'All';
      if (sortFilter) sortFilter.value = 'newest';
      loadAlerts();
    });
  }
}

async function loadAlerts() {
  const container = document.getElementById('alerts-feed-grid');
  const countEl = document.getElementById('alerts-count-label');
  if (!container) return;

  const search = document.getElementById('alert-search')?.value.trim() || '';
  const disasterType = document.getElementById('filter-type')?.value || 'All';
  const severity = document.getElementById('filter-severity')?.value || 'All';
  const status = document.getElementById('filter-status')?.value || 'All';
  const sort = document.getElementById('filter-sort')?.value || 'newest';

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align:center; padding: 40px; color:#64748B;">
      <i class="fas fa-spinner fa-spin" style="font-size:2rem; margin-bottom:12px;"></i>
      <p>Retrieving real-time disaster alerts...</p>
    </div>
  `;

  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (disasterType !== 'All') params.append('disasterType', disasterType);
    if (severity !== 'All') params.append('severity', severity);
    if (status !== 'All') params.append('status', status);
    if (sort) params.append('sort', sort);

    const res = await fetch(`/api/alerts?${params.toString()}`);
    const result = await res.json();
    const alerts = result.data || [];
    allAlerts = alerts;

    if (countEl) {
      countEl.textContent = `Showing ${alerts.length} alert${alerts.length === 1 ? '' : 's'}`;
    }

    if (alerts.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 60px 20px; background:#fff; border-radius:12px; border:1px solid #E2E8F0;">
          <i class="fas fa-filter-circle-xmark" style="font-size:3rem; color:#94A3B8; margin-bottom:16px;"></i>
          <h3 style="font-weight:700; color:#14243A; margin-bottom:8px;">No Matching Alerts Found</h3>
          <p style="color:#64748B; font-size:0.95rem; max-width:480px; margin:0 auto 20px auto;">
            Try loosening search terms or filter criteria to view other advisory bulletins.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = alerts.map(alert => renderAlertCard(alert)).join('');

    // Attach click triggers to open detailed modal
    container.querySelectorAll('.btn-view-alert').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        showModalDetails(id);
      });
    });

    // Check hash anchor in URL to auto-open modal if linked directly
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const match = alerts.find(a => a.id === hash);
      if (match) showModalDetails(hash);
    }
  } catch (err) {
    console.error('Failed to load alerts feed:', err);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 40px; color:#DC2626;">
        <i class="fas fa-triangle-exclamation" style="font-size:2rem; margin-bottom:12px;"></i>
        <p>Failed to load alerts. Please verify local server is running.</p>
      </div>
    `;
  }
}

function renderAlertCard(alert) {
  const sevBadge = `badge-${alert.severity.toLowerCase()}`;
  const statusBadge = alert.status === 'Active' ? 'badge-status-active' : 'badge-status-resolved';

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
          <span style="font-size:0.75rem; color:#94a3b8; font-weight:500;">(${alert.id})</span>
        </div>
        <div style="display:flex; gap:6px;">
          <span class="badge ${statusBadge}">${alert.status}</span>
          <span class="badge ${sevBadge}">${alert.severity}</span>
        </div>
      </div>
      <h3 class="alert-card-title">${escapeHTML(alert.title)}</h3>
      <div class="alert-card-location">
        <i class="fas fa-location-dot"></i> ${escapeHTML(alert.location)}
      </div>
      <p class="alert-card-desc">${escapeHTML(alert.description)}</p>
      <div style="background:#F8FAFC; padding:10px 12px; border-radius:6px; font-size:0.82rem; color:#475569; margin-bottom:14px; border-left:3px solid #2563EB;">
        <strong style="color:#1E293B;">Safety Action:</strong> ${escapeHTML(alert.safetyInstructions)}
      </div>
      <div class="alert-card-footer">
        <div>
          <span style="display:block;"><i class="far fa-clock"></i> Issued: ${formatDate(alert.createdAt)}</span>
          <span style="display:block; font-size:0.72rem; color:#94A3B8;">Source: ${escapeHTML(alert.source)}</span>
        </div>
        <button class="btn btn-secondary btn-sm btn-view-alert" data-id="${alert.id}">
          Full Details <i class="fas fa-arrow-up-right-from-square"></i>
        </button>
      </div>
    </div>
  `;
}

function showModalDetails(alertId) {
  const alert = allAlerts.find(a => a.id === alertId);
  if (!alert) return;

  let modal = document.getElementById('alert-full-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'alert-full-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge badge-${alert.severity.toLowerCase()}">${alert.severity}</span>
          <span class="badge ${alert.status === 'Active' ? 'badge-status-active' : 'badge-status-resolved'}">${alert.status}</span>
          <span style="font-weight:600; color:#64748B; font-size:0.85rem;">${alert.id}</span>
        </div>
        <button class="modal-close-btn" onclick="document.getElementById('alert-full-modal').classList.remove('active')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <h2 style="font-size:1.4rem; font-weight:800; color:#14243A; margin-bottom:12px;">${escapeHTML(alert.title)}</h2>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px; font-size:0.85rem; background:#F8FAFC; padding:14px; border-radius:8px;">
          <div><strong>Location:</strong> ${escapeHTML(alert.location)}</div>
          <div><strong>Disaster Type:</strong> ${alert.disasterType}</div>
          <div><strong>Estimated Impact:</strong> ${alert.affectedPopulationEst ? alert.affectedPopulationEst.toLocaleString() + ' citizens' : 'Under assessment'}</div>
          <div><strong>Originating Agency:</strong> ${escapeHTML(alert.source)}</div>
          <div><strong>Created:</strong> ${formatDate(alert.createdAt)}</div>
          <div><strong>Last Updated:</strong> ${formatDate(alert.updatedAt)}</div>
        </div>

        <div style="margin-bottom:18px;">
          <h4 style="font-size:0.95rem; font-weight:700; color:#14243A; margin-bottom:6px;">Detailed Incident Brief</h4>
          <p style="font-size:0.92rem; color:#374151; line-height:1.6;">${escapeHTML(alert.description)}</p>
        </div>

        <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-left:4px solid #2563EB; border-radius:8px; padding:16px; margin-bottom:18px;">
          <h4 style="font-size:0.92rem; font-weight:700; color:#1D4ED8; margin-bottom:6px;">
            <i class="fas fa-bullhorn"></i> Required Safety Directive
          </h4>
          <p style="font-size:0.9rem; color:#1E40AF; line-height:1.5;">${escapeHTML(alert.safetyInstructions)}</p>
        </div>

        <div style="background:#FEF3C7; border:1px solid #FCD34D; border-radius:6px; padding:10px 14px; font-size:0.78rem; color:#92400E; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-info-circle"></i>
          <span>Demonstration data only. This website does not currently provide verified live emergency warnings.</span>
        </div>
      </div>
      <div class="modal-footer">
        <a href="map.html" class="btn btn-primary btn-sm">
          <i class="fas fa-map-location-dot"></i> View on Live Map
        </a>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('alert-full-modal').classList.remove('active')">
          Close Window
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
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
