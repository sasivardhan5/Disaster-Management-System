// DisasterGuard - Administrator Command Console Script

let currentToken = null;
let chartsInstances = {};

document.addEventListener('DOMContentLoaded', () => {
  currentToken = localStorage.getItem('dg_auth_token');

  if (!currentToken) {
    showToast('Admin session required. Redirecting to login...', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 600);
    return;
  }

  initAdminUI();
  loadAdminOverview();
  loadAdminIncidents();
  loadAdminAlerts();
  loadAdminShelters();
  loadAnalyticsCharts();
});

function initAdminUI() {
  // Display admin name
  const user = JSON.parse(localStorage.getItem('dg_user') || '{}');
  const nameEl = document.getElementById('admin-user-display');
  if (nameEl) nameEl.textContent = user.name || user.email || 'Administrator';

  // Logout button
  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutAdmin();
    });
  }

  // Create Alert button
  const createAlertBtn = document.getElementById('btn-open-create-alert');
  if (createAlertBtn) {
    createAlertBtn.addEventListener('click', openCreateAlertModal);
  }

  // Create Shelter button
  const createShelterBtn = document.getElementById('btn-open-create-shelter');
  if (createShelterBtn) {
    createShelterBtn.addEventListener('click', openCreateShelterModal);
  }
}

// Fetch overview cards & storage mode
async function loadAdminOverview() {
  try {
    const res = await fetch('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    if (!res.ok) throw new Error('Failed to load stats');

    const { data } = await res.json();

    document.getElementById('admin-stat-total-incidents').textContent = data.totalIncidents ?? 0;
    document.getElementById('admin-stat-pending-reports').textContent = data.pendingReports ?? 0;
    document.getElementById('admin-stat-active-alerts').textContent = data.activeAlerts ?? 0;
    document.getElementById('admin-stat-resolved-incidents').textContent = data.resolvedIncidents ?? 0;

    // Display storage mode badge
    const storageBadge = document.getElementById('admin-storage-mode-badge');
    if (storageBadge && data.storageMode) {
      storageBadge.textContent = data.storageMode.description;
      if (data.storageMode.isDemo) {
        storageBadge.className = 'footer-disclaimer-pill';
      } else {
        storageBadge.className = 'badge badge-open';
      }
    }
  } catch (err) {
    console.error('Error loading admin overview:', err);
  }
}

// --- INCIDENT MANAGEMENT ---
async function loadAdminIncidents() {
  const tableBody = document.getElementById('admin-incidents-tbody');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:#64748B;"><i class="fas fa-spinner fa-spin"></i> Loading incident records...</td></tr>`;

  try {
    const res = await fetch('/api/incidents', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    const incidents = result.data || [];

    if (incidents.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:#64748B;">No incident reports logged.</td></tr>`;
      return;
    }

    tableBody.innerHTML = incidents.map(inc => {
      const verBadge = inc.verificationState === 'Verified' ? 'badge-verified' : (inc.verificationState === 'Rejected' ? 'badge-closed' : 'badge-pending');
      return `
        <tr>
          <td><strong style="color:#1E40AF;">${inc.id}</strong></td>
          <td><span class="badge" style="background:#F1F5F9; color:#334155;">${inc.incidentType}</span></td>
          <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHTML(inc.location)}">
            ${escapeHTML(inc.location)}
          </td>
          <td>
            <select class="filter-select" style="padding:4px 8px; font-size:0.8rem;" onchange="updateIncidentSeverity('${inc.id}', this.value)">
              <option value="Low" ${inc.urgencyLevel === 'Low' ? 'selected' : ''}>Low</option>
              <option value="Moderate" ${inc.urgencyLevel === 'Moderate' ? 'selected' : ''}>Moderate</option>
              <option value="High" ${inc.urgencyLevel === 'High' ? 'selected' : ''}>High</option>
              <option value="Critical" ${inc.urgencyLevel === 'Critical' ? 'selected' : ''}>Critical</option>
            </select>
          </td>
          <td><span class="badge ${verBadge}">${inc.verificationState}</span></td>
          <td>
            <select class="filter-select" style="padding:4px 8px; font-size:0.8rem;" onchange="updateIncidentStatus('${inc.id}', this.value)">
              <option value="Submitted" ${inc.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
              <option value="Under Review" ${inc.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
              <option value="Verified" ${inc.status === 'Verified' ? 'selected' : ''}>Verified</option>
              <option value="Response Assigned" ${inc.status === 'Response Assigned' ? 'selected' : ''}>Response Assigned</option>
              <option value="Resolved" ${inc.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>
          </td>
          <td style="font-size:0.78rem; color:#64748B;">${formatDate(inc.createdAt)}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" title="View Details" onclick="viewIncidentDetail('${inc.id}')">
                <i class="fas fa-eye"></i>
              </button>
              ${inc.verificationState !== 'Verified' ? `
                <button class="btn btn-success btn-sm" title="Verify Report" onclick="verifyIncident('${inc.id}', 'Verified')">
                  <i class="fas fa-check"></i>
                </button>
              ` : ''}
              ${inc.verificationState !== 'Rejected' ? `
                <button class="btn btn-secondary btn-sm" title="Reject Report" style="color:#DC2626;" onclick="verifyIncident('${inc.id}', 'Rejected')">
                  <i class="fas fa-times"></i>
                </button>
              ` : ''}
              <button class="btn btn-danger btn-sm" title="Delete Demo Record" onclick="confirmDeleteIncident('${inc.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:#DC2626;">Error loading incidents.</td></tr>`;
  }
}

async function updateIncidentStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Status update failed');
    showToast(`Incident ${id} status updated to "${newStatus}".`, 'success');
    loadAdminOverview();
    loadAnalyticsCharts();
  } catch (e) {
    showToast('Failed to update status', 'error');
  }
}

async function updateIncidentSeverity(id, newSeverity) {
  try {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ urgencyLevel: newSeverity })
    });
    if (!res.ok) throw new Error('Severity update failed');
    showToast(`Incident ${id} urgency set to "${newSeverity}".`, 'success');
    loadAnalyticsCharts();
  } catch (e) {
    showToast('Failed to update severity', 'error');
  }
}

async function verifyIncident(id, state) {
  try {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({
        verificationState: state,
        status: state === 'Verified' ? 'Verified' : 'Submitted'
      })
    });
    if (!res.ok) throw new Error('Verification failed');
    showToast(`Incident ${id} marked as ${state}.`, 'success');
    loadAdminIncidents();
    loadAdminOverview();
  } catch (e) {
    showToast('Error modifying verification state', 'error');
  }
}

async function confirmDeleteIncident(id) {
  if (!confirm(`Are you sure you want to permanently delete demonstration incident ${id}?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    if (!res.ok) throw new Error('Delete failed');
    showToast(`Incident ${id} deleted.`, 'info');
    loadAdminIncidents();
    loadAdminOverview();
    loadAnalyticsCharts();
  } catch (e) {
    showToast('Failed to delete incident', 'error');
  }
}

async function viewIncidentDetail(id) {
  try {
    const res = await fetch(`/api/incidents/${id}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const { data: inc } = await res.json();
    if (!inc) return;

    let modal = document.getElementById('admin-incident-view-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-incident-view-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Incident Dossier: ${inc.id}</h3>
          <button class="modal-close-btn" onclick="document.getElementById('admin-incident-view-modal').classList.remove('active')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <h4 style="font-size:1.15rem; font-weight:700; color:#14243A; margin-bottom:8px;">${escapeHTML(inc.title)}</h4>
          <p style="font-size:0.92rem; color:#475569; margin-bottom:16px;">${escapeHTML(inc.description)}</p>

          <div style="background:#F8FAFC; border-radius:8px; padding:14px; border:1px solid #E2E8F0; margin-bottom:16px; font-size:0.85rem;">
            <div><strong>Location:</strong> ${escapeHTML(inc.location)}</div>
            ${inc.coordinates?.lat ? `<div><strong>Coordinates:</strong> ${inc.coordinates.lat}, ${inc.coordinates.lng}</div>` : ''}
            <div><strong>Reported By:</strong> ${escapeHTML(inc.reportedBy)}</div>
            <div><strong>Contact Phone:</strong> ${escapeHTML(inc.contactPhone || 'None Provided')}</div>
            <div><strong>Affected Population:</strong> ${inc.affectedCount} individuals</div>
          </div>

          ${inc.imageUrl ? `
            <div style="margin-bottom:16px;">
              <h5 style="font-size:0.85rem; color:#64748B; margin-bottom:6px;">Citizen Photo Upload</h5>
              <img src="${inc.imageUrl}" alt="Incident Attachment" style="max-height:220px; border-radius:8px; border:1px solid #E2E8F0;" />
            </div>
          ` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('admin-incident-view-modal').classList.remove('active')">Close</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  } catch (e) {
    showToast('Failed to open incident details', 'error');
  }
}

// --- ALERT MANAGEMENT ---
async function loadAdminAlerts() {
  const container = document.getElementById('admin-alerts-tbody');
  if (!container) return;

  try {
    const res = await fetch('/api/alerts');
    const result = await res.json();
    const alerts = result.data || [];

    if (alerts.length === 0) {
      container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#64748B;">No alerts found.</td></tr>`;
      return;
    }

    container.innerHTML = alerts.map(a => `
      <tr>
        <td><strong>${a.id}</strong></td>
        <td>${a.disasterType}</td>
        <td>${escapeHTML(a.title)}</td>
        <td><span class="badge badge-${a.severity.toLowerCase()}">${a.severity}</span></td>
        <td><span class="badge ${a.status === 'Active' ? 'badge-status-active' : 'badge-status-resolved'}">${a.status}</span></td>
        <td style="font-size:0.78rem; color:#64748B;">${formatDate(a.createdAt)}</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-sm" title="Edit Alert" onclick="openEditAlertModal('${a.id}')">
              <i class="fas fa-pen-to-square"></i> Edit
            </button>
            ${a.status === 'Active' ? `
              <button class="btn btn-success btn-sm" title="Resolve Alert" onclick="resolveAlert('${a.id}')">
                <i class="fas fa-check-double"></i> Resolve
              </button>
            ` : ''}
            <button class="btn btn-danger btn-sm" title="Delete Alert" onclick="confirmDeleteAlert('${a.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading admin alerts:', err);
  }
}

async function resolveAlert(id) {
  try {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ status: 'Resolved' })
    });
    if (!res.ok) throw new Error('Resolve failed');
    showToast(`Alert ${id} resolved.`, 'success');
    loadAdminAlerts();
    loadAdminOverview();
  } catch (e) {
    showToast('Failed to resolve alert', 'error');
  }
}

async function confirmDeleteAlert(id) {
  if (!confirm(`Delete official alert ${id}?`)) return;
  try {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    if (!res.ok) throw new Error('Delete failed');
    showToast(`Alert ${id} deleted.`, 'info');
    loadAdminAlerts();
    loadAdminOverview();
  } catch (e) {
    showToast('Failed to delete alert', 'error');
  }
}

function openCreateAlertModal() {
  let modal = document.getElementById('modal-create-alert');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-create-alert';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Issue New Official Disaster Alert</h3>
          <button class="modal-close-btn" onclick="document.getElementById('modal-create-alert').classList.remove('active')"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="form-new-alert">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Disaster Type <span class="req">*</span></label>
                <select class="form-control" id="new-alert-type" required>
                  <option value="Flood">Flood</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Fire">Fire</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Heatwave">Heatwave</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Severity Level <span class="req">*</span></label>
                <select class="form-control" id="new-alert-severity" required>
                  <option value="Low">Low</option>
                  <option value="Moderate" selected>Moderate</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Alert Headline <span class="req">*</span></label>
              <input type="text" class="form-control" id="new-alert-title" required placeholder="e.g. Flash Flood Emergency Watch" />
            </div>
            <div class="form-group">
              <label class="form-label">Affected Location <span class="req">*</span></label>
              <input type="text" class="form-control" id="new-alert-location" required placeholder="e.g. East Delta Basin, Ward 9" />
            </div>
            <div class="form-group">
              <label class="form-label">Situation Description <span class="req">*</span></label>
              <textarea class="form-control" id="new-alert-desc" required placeholder="Detail the physical risk parameters..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Recommended Safety Actions <span class="req">*</span></label>
              <textarea class="form-control" id="new-alert-safety" required placeholder="e.g. Evacuate low-lying river areas immediately..."></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Latitude</label>
                <input type="number" step="any" class="form-control" id="new-alert-lat" value="17.3850" />
              </div>
              <div class="form-group">
                <label class="form-label">Longitude</label>
                <input type="number" step="any" class="form-control" id="new-alert-lng" value="78.4867" />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-create-alert').classList.remove('active')">Cancel</button>
          <button class="btn btn-primary" id="btn-save-new-alert">Broadcast Alert</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btn-save-new-alert').addEventListener('click', async () => {
      const disasterType = document.getElementById('new-alert-type').value;
      const severity = document.getElementById('new-alert-severity').value;
      const title = document.getElementById('new-alert-title').value.trim();
      const location = document.getElementById('new-alert-location').value.trim();
      const description = document.getElementById('new-alert-desc').value.trim();
      const safetyInstructions = document.getElementById('new-alert-safety').value.trim();
      const lat = parseFloat(document.getElementById('new-alert-lat').value);
      const lng = parseFloat(document.getElementById('new-alert-lng').value);

      if (!title || !location || !description || !safetyInstructions) {
        showToast('Please fill all required alert fields', 'warning');
        return;
      }

      try {
        const res = await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify({
            disasterType,
            severity,
            title,
            location,
            description,
            safetyInstructions,
            lat,
            lng
          })
        });

        if (!res.ok) throw new Error('Creation failed');
        modal.classList.remove('active');
        showToast('Alert broadcast successfully registered!', 'success');
        loadAdminAlerts();
        loadAdminOverview();
      } catch (err) {
        showToast('Error registering alert broadcast', 'error');
      }
    });
  }
  modal.classList.add('active');
}

async function openEditAlertModal(alertId) {
  try {
    const res = await fetch(`/api/alerts/${alertId}`);
    const { data: alert } = await res.json();
    if (!alert) return;

    let modal = document.getElementById('modal-edit-alert');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-edit-alert';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Edit Alert: ${alert.id}</h3>
          <button class="modal-close-btn" onclick="document.getElementById('modal-edit-alert').classList.remove('active')"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="form-edit-alert">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Disaster Type</label>
                <select class="form-control" id="edit-alert-type">
                  <option value="Flood" ${alert.disasterType === 'Flood' ? 'selected' : ''}>Flood</option>
                  <option value="Cyclone" ${alert.disasterType === 'Cyclone' ? 'selected' : ''}>Cyclone</option>
                  <option value="Earthquake" ${alert.disasterType === 'Earthquake' ? 'selected' : ''}>Earthquake</option>
                  <option value="Fire" ${alert.disasterType === 'Fire' ? 'selected' : ''}>Fire</option>
                  <option value="Landslide" ${alert.disasterType === 'Landslide' ? 'selected' : ''}>Landslide</option>
                  <option value="Heatwave" ${alert.disasterType === 'Heatwave' ? 'selected' : ''}>Heatwave</option>
                  <option value="Other" ${alert.disasterType === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Severity Level</label>
                <select class="form-control" id="edit-alert-severity">
                  <option value="Low" ${alert.severity === 'Low' ? 'selected' : ''}>Low</option>
                  <option value="Moderate" ${alert.severity === 'Moderate' ? 'selected' : ''}>Moderate</option>
                  <option value="High" ${alert.severity === 'High' ? 'selected' : ''}>High</option>
                  <option value="Critical" ${alert.severity === 'Critical' ? 'selected' : ''}>Critical</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Headline / Title</label>
              <input type="text" class="form-control" id="edit-alert-title" value="${escapeHTML(alert.title)}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" class="form-control" id="edit-alert-location" value="${escapeHTML(alert.location)}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Situation Description</label>
              <textarea class="form-control" id="edit-alert-desc" rows="3" required>${escapeHTML(alert.description)}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Recommended Safety Actions</label>
              <textarea class="form-control" id="edit-alert-safety" rows="2" required>${escapeHTML(alert.safetyInstructions)}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-control" id="edit-alert-status">
                <option value="Active" ${alert.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Monitoring" ${alert.status === 'Monitoring' ? 'selected' : ''}>Monitoring</option>
                <option value="Resolved" ${alert.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-edit-alert').classList.remove('active')">Cancel</button>
          <button class="btn btn-primary" id="btn-save-edit-alert">Save Changes</button>
        </div>
      </div>
    `;

    document.getElementById('btn-save-edit-alert').onclick = async () => {
      const updates = {
        disasterType: document.getElementById('edit-alert-type').value,
        severity: document.getElementById('edit-alert-severity').value,
        title: document.getElementById('edit-alert-title').value.trim(),
        location: document.getElementById('edit-alert-location').value.trim(),
        description: document.getElementById('edit-alert-desc').value.trim(),
        safetyInstructions: document.getElementById('edit-alert-safety').value.trim(),
        status: document.getElementById('edit-alert-status').value
      };

      try {
        const putRes = await fetch(`/api/alerts/${alertId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(updates)
        });

        if (!putRes.ok) throw new Error('Update failed');
        modal.classList.remove('active');
        showToast(`Alert ${alertId} updated successfully.`, 'success');
        loadAdminAlerts();
        loadAdminOverview();
      } catch (e) {
        showToast('Failed to update alert', 'error');
      }
    };

    modal.classList.add('active');
  } catch (err) {
    showToast('Failed to load alert for editing', 'error');
  }
}

// --- SHELTER MANAGEMENT ---
async function loadAdminShelters() {
  const container = document.getElementById('admin-shelters-tbody');
  if (!container) return;

  try {
    const res = await fetch('/api/shelters');
    const result = await res.json();
    const shelters = result.data || [];

    if (shelters.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#64748B;">No shelters listed.</td></tr>`;
      return;
    }

    container.innerHTML = shelters.map(s => `
      <tr>
        <td><strong>${s.id}</strong></td>
        <td>${escapeHTML(s.name)}</td>
        <td>${escapeHTML(s.address)}</td>
        <td>${s.capacity} beds</td>
        <td>
          <select class="filter-select" style="padding:4px 8px; font-size:0.8rem;" onchange="updateShelterStatus('${s.id}', this.value)">
            <option value="Open" ${s.operationalStatus === 'Open' ? 'selected' : ''}>Open</option>
            <option value="Near Capacity" ${s.operationalStatus === 'Near Capacity' ? 'selected' : ''}>Near Capacity</option>
            <option value="Closed" ${s.operationalStatus === 'Closed' ? 'selected' : ''}>Closed</option>
            <option value="Preparing" ${s.operationalStatus === 'Preparing' ? 'selected' : ''}>Preparing</option>
          </select>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-sm" title="Edit Shelter" onclick="openEditShelterModal('${s.id}')">
              <i class="fas fa-pen-to-square"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm" title="Delete Shelter" onclick="confirmDeleteShelter('${s.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading admin shelters:', err);
  }
}

async function updateShelterStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/shelters/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ operationalStatus: newStatus })
    });
    if (!res.ok) throw new Error('Shelter status update failed');
    showToast(`Shelter ${id} operational status updated to ${newStatus}.`, 'success');
  } catch (e) {
    showToast('Failed to update shelter status', 'error');
  }
}

async function confirmDeleteShelter(id) {
  if (!confirm(`Delete relief shelter ${id}?`)) return;
  try {
    const res = await fetch(`/api/shelters/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    if (!res.ok) throw new Error('Delete failed');
    showToast(`Shelter ${id} removed.`, 'info');
    loadAdminShelters();
    loadAdminOverview();
  } catch (e) {
    showToast('Failed to delete shelter', 'error');
  }
}

function openCreateShelterModal() {
  let modal = document.getElementById('modal-create-shelter');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-create-shelter';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Register New Relief Shelter</h3>
          <button class="modal-close-btn" onclick="document.getElementById('modal-create-shelter').classList.remove('active')"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="form-new-shelter">
            <div class="form-group">
              <label class="form-label">Shelter Name <span class="req">*</span></label>
              <input type="text" class="form-control" id="new-shl-name" required placeholder="e.g. West District Sports Arena" />
            </div>
            <div class="form-group">
              <label class="form-label">Physical Address <span class="req">*</span></label>
              <input type="text" class="form-control" id="new-shl-addr" required placeholder="e.g. 104 Highway Road, Sector 3" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Total Bed Capacity <span class="req">*</span></label>
                <input type="number" class="form-control" id="new-shl-cap" required value="200" />
              </div>
              <div class="form-group">
                <label class="form-label">Initial Available Beds</label>
                <input type="number" class="form-control" id="new-shl-beds" value="200" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Facilities (comma-separated)</label>
              <input type="text" class="form-control" id="new-shl-fac" value="Drinking water, Food, Medical support, Power backup" />
            </div>
            <div class="form-group">
              <label class="form-label">Emergency Helpline Contact</label>
              <input type="text" class="form-control" id="new-shl-contact" value="+91 40 2345 6789" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-create-shelter').classList.remove('active')">Cancel</button>
          <button class="btn btn-primary" id="btn-save-new-shelter">Save Shelter</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btn-save-new-shelter').addEventListener('click', async () => {
      const name = document.getElementById('new-shl-name').value.trim();
      const address = document.getElementById('new-shl-addr').value.trim();
      const capacity = document.getElementById('new-shl-cap').value;
      const availableBeds = document.getElementById('new-shl-beds').value;
      const facilities = document.getElementById('new-shl-fac').value;
      const contactInfo = document.getElementById('new-shl-contact').value;

      if (!name || !address || !capacity) {
        showToast('Please provide Shelter Name, Address, and Capacity', 'warning');
        return;
      }

      try {
        const res = await fetch('/api/shelters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify({
            name,
            address,
            capacity: parseInt(capacity, 10),
            availableBeds: availableBeds ? parseInt(availableBeds, 10) : null,
            facilities,
            contactInfo
          })
        });

        if (!res.ok) throw new Error('Create shelter failed');
        modal.classList.remove('active');
        showToast('Relief Shelter successfully listed!', 'success');
        loadAdminShelters();
        loadAdminOverview();
      } catch (e) {
        showToast('Failed to register shelter', 'error');
      }
    });
  }
  modal.classList.add('active');
}

async function openEditShelterModal(shelterId) {
  try {
    const res = await fetch(`/api/shelters/${shelterId}`);
    const { data: s } = await res.json();
    if (!s) return;

    let modal = document.getElementById('modal-edit-shelter');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-edit-shelter';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const facString = Array.isArray(s.facilities) ? s.facilities.join(', ') : (s.facilities || '');

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Edit Shelter: ${s.id}</h3>
          <button class="modal-close-btn" onclick="document.getElementById('modal-edit-shelter').classList.remove('active')"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="form-edit-shelter">
            <div class="form-group">
              <label class="form-label">Shelter Name</label>
              <input type="text" class="form-control" id="edit-shl-name" value="${escapeHTML(s.name)}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Address</label>
              <input type="text" class="form-control" id="edit-shl-addr" value="${escapeHTML(s.address)}" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Capacity (Total Beds)</label>
                <input type="number" class="form-control" id="edit-shl-cap" value="${s.capacity}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Available Free Beds</label>
                <input type="number" class="form-control" id="edit-shl-beds" value="${s.availableBeds !== null ? s.availableBeds : ''}" placeholder="Leave blank if unknown" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Operational Status</label>
              <select class="form-control" id="edit-shl-status">
                <option value="Open" ${s.operationalStatus === 'Open' ? 'selected' : ''}>Open</option>
                <option value="Near Capacity" ${s.operationalStatus === 'Near Capacity' ? 'selected' : ''}>Near Capacity</option>
                <option value="Closed" ${s.operationalStatus === 'Closed' ? 'selected' : ''}>Closed</option>
                <option value="Preparing" ${s.operationalStatus === 'Preparing' ? 'selected' : ''}>Preparing</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Facilities (Comma-separated)</label>
              <input type="text" class="form-control" id="edit-shl-fac" value="${escapeHTML(facString)}" />
            </div>
            <div class="form-group">
              <label class="form-label">Contact Information</label>
              <input type="text" class="form-control" id="edit-shl-contact" value="${escapeHTML(s.contactInfo || '')}" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-edit-shelter').classList.remove('active')">Cancel</button>
          <button class="btn btn-primary" id="btn-save-edit-shelter">Save Changes</button>
        </div>
      </div>
    `;

    document.getElementById('btn-save-edit-shelter').onclick = async () => {
      const updates = {
        name: document.getElementById('edit-shl-name').value.trim(),
        address: document.getElementById('edit-shl-addr').value.trim(),
        capacity: parseInt(document.getElementById('edit-shl-cap').value, 10),
        availableBeds: document.getElementById('edit-shl-beds').value ? parseInt(document.getElementById('edit-shl-beds').value, 10) : null,
        operationalStatus: document.getElementById('edit-shl-status').value,
        facilities: document.getElementById('edit-shl-fac').value.split(',').map(f => f.trim()).filter(Boolean),
        contactInfo: document.getElementById('edit-shl-contact').value.trim()
      };

      try {
        const putRes = await fetch(`/api/shelters/${shelterId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(updates)
        });

        if (!putRes.ok) throw new Error('Update failed');
        modal.classList.remove('active');
        showToast(`Shelter ${shelterId} updated successfully.`, 'success');
        loadAdminShelters();
        loadAdminOverview();
      } catch (e) {
        showToast('Failed to update shelter', 'error');
      }
    };

    modal.classList.add('active');
  } catch (err) {
    showToast('Failed to load shelter for editing', 'error');
  }
}

// --- CHART.JS ANALYTICS ---
async function loadAnalyticsCharts() {
  try {
    const res = await fetch('/api/dashboard/analytics');
    const { data } = await res.json();
    if (!data) return;

    // 1. Incidents by Category (Doughnut)
    const ctxCat = document.getElementById('chart-by-category');
    if (ctxCat) {
      if (chartsInstances.category) chartsInstances.category.destroy();
      chartsInstances.category = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: Object.keys(data.byCategory),
          datasets: [{
            data: Object.values(data.byCategory),
            backgroundColor: ['#2563EB', '#0284C7', '#D97706', '#DC2626', '#16A34A', '#78350F', '#64748B']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 2. Incidents by Severity (Bar)
    const ctxSev = document.getElementById('chart-by-severity');
    if (ctxSev) {
      if (chartsInstances.severity) chartsInstances.severity.destroy();
      chartsInstances.severity = new Chart(ctxSev, {
        type: 'bar',
        data: {
          labels: ['Low', 'Moderate', 'High', 'Critical'],
          datasets: [{
            label: 'Incident Count',
            data: [
              data.bySeverity.Low || 0,
              data.bySeverity.Moderate || 0,
              data.bySeverity.High || 0,
              data.bySeverity.Critical || 0
            ],
            backgroundColor: ['#16A34A', '#F59E0B', '#EA580C', '#DC2626']
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          plugins: { legend: { display: false } }
        }
      });
    }

    // 3. Status Breakdown (Pie)
    const ctxStatus = document.getElementById('chart-status-breakdown');
    if (ctxStatus) {
      if (chartsInstances.status) chartsInstances.status.destroy();
      chartsInstances.status = new Chart(ctxStatus, {
        type: 'pie',
        data: {
          labels: ['Resolved', 'Pending / Under Response'],
          datasets: [{
            data: [data.statusBreakdown.resolved, data.statusBreakdown.unresolved],
            backgroundColor: ['#16A34A', '#F59E0B']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 4. Incident Reports Timeline (Line)
    const ctxTime = document.getElementById('chart-timeline');
    if (ctxTime) {
      if (chartsInstances.timeline) chartsInstances.timeline.destroy();
      chartsInstances.timeline = new Chart(ctxTime, {
        type: 'line',
        data: {
          labels: data.timeline.labels,
          datasets: [{
            label: 'Incident Reports Logged',
            data: data.timeline.counts,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });
    }
  } catch (err) {
    console.error('Error generating Chart.js visualizations:', err);
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
