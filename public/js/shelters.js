// DisasterGuard - Relief Shelters Directory Script

let allShelters = [];

document.addEventListener('DOMContentLoaded', () => {
  initShelterFilters();
  loadShelters();
});

function initShelterFilters() {
  const searchInput = document.getElementById('shelter-search');
  const facilityFilter = document.getElementById('filter-facility');
  const statusFilter = document.getElementById('filter-status');
  const resetBtn = document.getElementById('btn-reset-shelter-filters');

  const triggerFetch = () => loadShelters();

  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(triggerFetch, 250);
    });
  }

  if (facilityFilter) facilityFilter.addEventListener('change', triggerFetch);
  if (statusFilter) statusFilter.addEventListener('change', triggerFetch);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (facilityFilter) facilityFilter.value = 'All';
      if (statusFilter) statusFilter.value = 'All';
      loadShelters();
    });
  }
}

async function loadShelters() {
  const container = document.getElementById('shelters-grid-container');
  const countEl = document.getElementById('shelters-count-label');
  if (!container) return;

  const search = document.getElementById('shelter-search')?.value.trim() || '';
  const facility = document.getElementById('filter-facility')?.value || 'All';
  const status = document.getElementById('filter-status')?.value || 'All';

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align:center; padding: 40px; color:#64748B;">
      <i class="fas fa-spinner fa-spin" style="font-size:2rem; margin-bottom:12px;"></i>
      <p>Loading relief shelter availability...</p>
    </div>
  `;

  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (facility !== 'All') params.append('facility', facility);
    if (status !== 'All') params.append('status', status);

    const res = await fetch(`/api/shelters?${params.toString()}`);
    const result = await res.json();
    const shelters = result.data || [];
    allShelters = shelters;

    if (countEl) {
      countEl.textContent = `Showing ${shelters.length} relief center${shelters.length === 1 ? '' : 's'}`;
    }

    if (shelters.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 60px 20px; background:#fff; border-radius:12px; border:1px solid #E2E8F0;">
          <i class="fas fa-campground" style="font-size:3rem; color:#94A3B8; margin-bottom:16px;"></i>
          <h3 style="font-weight:700; color:#14243A; margin-bottom:8px;">No Shelters Match Your Criteria</h3>
          <p style="color:#64748B; font-size:0.95rem; max-width:450px; margin:0 auto;">
            Try clearing facility or status filters to discover available evacuation shelters.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = shelters.map(shelter => renderShelterCard(shelter)).join('');
  } catch (err) {
    console.error('Failed to load shelters:', err);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 40px; color:#DC2626;">
        <i class="fas fa-triangle-exclamation" style="font-size:2rem; margin-bottom:12px;"></i>
        <p>Failed to retrieve shelters. Please check server connection.</p>
      </div>
    `;
  }
}

function renderShelterCard(s) {
  let statusBadgeClass = 'badge-open';
  if (s.operationalStatus === 'Near Capacity') statusBadgeClass = 'badge-near-capacity';
  if (s.operationalStatus === 'Closed') statusBadgeClass = 'badge-closed';
  if (s.operationalStatus === 'Preparing') statusBadgeClass = 'badge-preparing';

  // Capacity calculation
  let bedInfoHtml = '';
  let fillPercent = 0;
  let fillColor = '#16A34A';

  if (s.availableBeds !== null && s.availableBeds !== undefined) {
    const occupied = Math.max(0, s.capacity - s.availableBeds);
    fillPercent = Math.min(100, Math.round((occupied / s.capacity) * 100));

    if (fillPercent > 85) fillColor = '#DC2626';
    else if (fillPercent > 60) fillColor = '#F59E0B';

    bedInfoHtml = `
      <div class="capacity-progress-wrap">
        <div class="capacity-labels">
          <span>Occupancy (${fillPercent}%)</span>
          <span><strong>${s.availableBeds}</strong> beds free of ${s.capacity}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${fillPercent}%; background-color: ${fillColor};"></div>
        </div>
      </div>
    `;
  } else {
    bedInfoHtml = `
      <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; padding:8px 12px; margin-bottom:14px; font-size:0.82rem; color:#64748B;">
        <i class="fas fa-circle-info"></i> Availability not verified &bull; Total Capacity: ${s.capacity}
      </div>
    `;
  }

  // Facilities
  const facilitiesList = Array.isArray(s.facilities) ? s.facilities : ['Drinking water'];
  const facHtml = facilitiesList.map(f => `
    <span class="facility-tag"><i class="fas fa-check"></i> ${escapeHTML(f)}</span>
  `).join('');

  // Map link coordinates
  const lat = s.coordinates?.lat || 17.39;
  const lng = s.coordinates?.lng || 78.48;

  return `
    <div class="shelter-card">
      <div class="shelter-card-header">
        <span class="badge ${statusBadgeClass}">${s.operationalStatus}</span>
        <span style="font-size:0.75rem; color:#94A3B8; font-weight:600;">${s.id}</span>
      </div>
      <h3 class="shelter-name">${escapeHTML(s.name)}</h3>
      <div class="shelter-address">
        <i class="fas fa-location-dot text-primary"></i> ${escapeHTML(s.address)}
      </div>

      ${bedInfoHtml}

      <div style="font-size:0.82rem; font-weight:600; color:#475569; margin-bottom:6px;">Available Facilities:</div>
      <div class="shelter-facilities-list">
        ${facHtml}
      </div>

      ${s.notes ? `<div style="font-size:0.8rem; color:#64748B; font-style:italic; margin-bottom:12px;">"${escapeHTML(s.notes)}"</div>` : ''}

      <div style="font-size:0.82rem; color:#475569; margin-bottom:14px;">
        <i class="fas fa-phone-alt"></i> <strong>Contact:</strong> ${escapeHTML(s.contactInfo)}
      </div>

      <div class="shelter-card-footer">
        <span style="font-size:0.75rem; color:#94A3B8;">Updated: ${formatDate(s.lastUpdated)}</span>
        <a href="map.html?lat=${lat}&lng=${lng}" class="btn btn-secondary btn-sm">
          <i class="fas fa-map-pin"></i> View on Map
        </a>
      </div>
    </div>
  `;
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
