// DisasterGuard - Incident Reporting & Verification Tracker

document.addEventListener('DOMContentLoaded', () => {
  initReportForm();
  initTrackReport();
  initImageUploadPreview();
  initLocationDetector();
});

// Setup Incident Submission Form
function initReportForm() {
  const form = document.getElementById('incident-report-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('report-submit-btn');
    const feedbackBox = document.getElementById('form-feedback-message');
    if (feedbackBox) {
      feedbackBox.style.display = 'none';
      feedbackBox.textContent = '';
    }

    // Client-side Validation
    const incidentType = document.getElementById('incident-type')?.value;
    const title = document.getElementById('incident-title')?.value.trim();
    const description = document.getElementById('incident-desc')?.value.trim();
    const location = document.getElementById('incident-location')?.value.trim();
    const affectedCount = document.getElementById('incident-affected')?.value;
    const urgencyLevel = document.getElementById('incident-urgency')?.value;
    const contactPhone = document.getElementById('incident-contact')?.value.trim();
    const lat = document.getElementById('incident-lat')?.value.trim();
    const lng = document.getElementById('incident-lng')?.value.trim();
    const imageFile = document.getElementById('incident-image')?.files[0];

    if (!incidentType || !title || !description || !location) {
      showFormError('Please fill out all required fields: Incident Category, Title, Description, and Location.');
      return;
    }

    if (lat) {
      const parsedLat = parseFloat(lat);
      if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
        showFormError('Latitude must be between -90 and +90 degrees.');
        return;
      }
    }

    if (lng) {
      const parsedLng = parseFloat(lng);
      if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
        showFormError('Longitude must be between -180 and +180 degrees.');
        return;
      }
    }

    if (affectedCount && parseInt(affectedCount, 10) < 0) {
      showFormError('Affected population must be a positive number.');
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append('incidentType', incidentType);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('affectedCount', affectedCount || '1');
    formData.append('urgencyLevel', urgencyLevel || 'Moderate');
    if (contactPhone) formData.append('contactPhone', contactPhone);
    if (lat) formData.append('latitude', lat);
    if (lng) formData.append('longitude', lng);
    if (imageFile) formData.append('image', imageFile);

    // Disable button to prevent duplicate submissions
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Emergency Report...';

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Submission failed. Please try again.');
      }

      // Reset form
      form.reset();
      clearImagePreview();

      // Show success modal with reference ID
      openSuccessModal(result.referenceId, result.data);
      showToast('Incident reported successfully.', 'success');
    } catch (err) {
      console.error('Incident report error:', err);
      showFormError(err.message || 'Error transmitting incident report.');
      showToast(err.message || 'Error transmitting incident report.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

function showFormError(msg) {
  const feedbackBox = document.getElementById('form-feedback-message');
  if (feedbackBox) {
    feedbackBox.className = 'alert-box-error';
    feedbackBox.style.display = 'block';
    feedbackBox.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${msg}`;
    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    showToast(msg, 'error');
  }
}

// Success Modal Handler
function openSuccessModal(referenceId, incident) {
  let modal = document.getElementById('incident-success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'incident-success-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header" style="background:#F0FDF4; border-bottom:1px solid #BBF7D0;">
        <h3 style="color:#16A34A; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-circle-check"></i> Report Transmitted
        </h3>
        <button class="modal-close-btn" onclick="document.getElementById('incident-success-modal').classList.remove('active')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p style="color:#374151; font-size:0.95rem; margin-bottom:16px;">
          Your incident report has been securely registered with DisasterGuard Operations.
        </p>

        <div style="background:#F8FAFC; border:2px dashed #2563EB; border-radius:10px; padding:18px; text-align:center; margin-bottom:20px;">
          <span style="font-size:0.8rem; color:#64748B; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Unique Incident Tracking Reference</span>
          <div style="font-size:1.6rem; font-weight:800; color:#1E40AF; letter-spacing:0.04em; margin:6px 0;" id="copy-ref-id">${referenceId}</div>
          <button class="btn btn-secondary btn-sm" onclick="copyReferenceId('${referenceId}')">
            <i class="far fa-copy"></i> Copy Reference ID
          </button>
        </div>

        <div style="font-size:0.85rem; color:#475569; background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:12px; margin-bottom:16px;">
          <strong>Demonstration Note:</strong> This report is stored in the project database under review status: <em>Submitted</em>. You can check its verification status anytime using the reference code above.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="document.getElementById('incident-success-modal').classList.remove('active')">
          Done
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function copyReferenceId(id) {
  navigator.clipboard.writeText(id).then(() => {
    showToast(`Copied reference ID: ${id}`, 'success');
  }).catch(() => {
    showToast(`Reference ID: ${id}`, 'info');
  });
}

// Track Existing Report Lookup
function initTrackReport() {
  const trackBtn = document.getElementById('btn-track-lookup');
  const trackInput = document.getElementById('track-reference-id');
  const trackResult = document.getElementById('track-result-container');

  if (!trackBtn || !trackInput || !trackResult) return;

  const performLookup = async () => {
    const id = trackInput.value.trim().toUpperCase();
    if (!id) {
      showToast('Please enter an Incident Reference ID (e.g., DG-2026-1001)', 'warning');
      return;
    }

    trackBtn.disabled = true;
    trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    trackResult.innerHTML = '';

    try {
      const res = await fetch(`/api/incidents/${id}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        trackResult.innerHTML = `
          <div style="padding:16px; background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; color:#DC2626; font-size:0.9rem;">
            <i class="fas fa-circle-xmark"></i> ${result.message || 'Report not found.'}
          </div>
        `;
        return;
      }

      const inc = result.data;
      renderTrackProgress(trackResult, inc);
    } catch (err) {
      trackResult.innerHTML = `
        <div style="padding:16px; background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; color:#DC2626; font-size:0.9rem;">
          <i class="fas fa-triangle-exclamation"></i> Network error retrieving incident details.
        </div>
      `;
    } finally {
      trackBtn.disabled = false;
      trackBtn.innerHTML = '<i class="fas fa-search"></i> Track Status';
    }
  };

  trackBtn.addEventListener('click', performLookup);
  trackInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performLookup();
  });
}

function renderTrackProgress(container, inc) {
  const steps = ['Submitted', 'Under Review', 'Verified', 'Response Assigned', 'Resolved'];
  const currentIndex = steps.indexOf(inc.status);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;

  const stepsHtml = steps.map((s, idx) => {
    const isDone = idx <= activeIdx;
    const isCurrent = idx === activeIdx;
    const color = isDone ? '#16A34A' : '#CBD5E1';
    const icon = isDone ? 'fa-check' : 'fa-circle';

    return `
      <div style="flex:1; text-align:center; position:relative;">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${isDone ? '#16A34A' : '#F1F5F9'};
          color: ${isDone ? '#fff' : '#94A3B8'};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 6px auto;
          font-size: 0.8rem;
          font-weight: 700;
          border: 2px solid ${isDone ? '#16A34A' : '#E2E8F0'};
        ">
          <i class="fas ${icon}"></i>
        </div>
        <div style="font-size:0.75rem; font-weight:${isCurrent ? '700' : '500'}; color:${isCurrent ? '#14243A' : '#64748B'};">
          ${s}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:20px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid #F1F5F9; padding-bottom:10px;">
        <div>
          <span style="font-size:0.78rem; color:#64748B; font-weight:700;">REFERENCE CODE</span>
          <h4 style="font-size:1.15rem; color:#14243A; font-weight:800;">${inc.id}</h4>
        </div>
        <div>
          <span class="badge ${inc.verificationState === 'Verified' ? 'badge-verified' : 'badge-pending'}">${inc.verificationState}</span>
        </div>
      </div>

      <!-- Stepper Indicator -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin:24px 0; position:relative;">
        ${stepsHtml}
      </div>

      <div style="background:#F8FAFC; border-radius:8px; padding:14px; font-size:0.85rem; color:#374151; line-height:1.5;">
        <div style="margin-bottom:6px;"><strong>Title:</strong> ${escapeHTML(inc.title)}</div>
        <div style="margin-bottom:6px;"><strong>Location:</strong> ${escapeHTML(inc.location)}</div>
        <div style="margin-bottom:6px;"><strong>Category:</strong> ${inc.incidentType} &bull; <strong>Urgency:</strong> ${inc.urgencyLevel}</div>
        <div><strong>Logged On:</strong> ${formatDate(inc.createdAt)}</div>
      </div>
    </div>
  `;
}

// Auto-fill GPS coordinates using browser Geolocation
function initLocationDetector() {
  const detectBtn = document.getElementById('btn-detect-location');
  if (!detectBtn) return;

  detectBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    detectBtn.disabled = true;
    detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting GPS...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latInput = document.getElementById('incident-lat');
        const lngInput = document.getElementById('incident-lng');
        if (latInput) latInput.value = pos.coords.latitude.toFixed(6);
        if (lngInput) lngInput.value = pos.coords.longitude.toFixed(6);

        detectBtn.disabled = false;
        detectBtn.innerHTML = '<i class="fas fa-check"></i> GPS Captured';
        showToast('Current GPS coordinates filled into form.', 'success');
      },
      (err) => {
        detectBtn.disabled = false;
        detectBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use GPS';
        showToast('Unable to acquire location. Please enter coordinates manually.', 'warning');
      },
      { timeout: 8000 }
    );
  });
}

// Image upload preview handler
function initImageUploadPreview() {
  const fileInput = document.getElementById('incident-image');
  const previewWrap = document.getElementById('image-preview-wrapper');
  const previewImg = document.getElementById('image-preview-tag');
  const fileNameDisplay = document.getElementById('file-chosen-name');

  if (!fileInput) return;

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      if (fileNameDisplay) fileNameDisplay.textContent = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (previewImg) previewImg.src = e.target.result;
        if (previewWrap) previewWrap.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      clearImagePreview();
    }
  });
}

function clearImagePreview() {
  const fileInput = document.getElementById('incident-image');
  const previewWrap = document.getElementById('image-preview-wrapper');
  const fileNameDisplay = document.getElementById('file-chosen-name');
  if (fileInput) fileInput.value = '';
  if (previewWrap) previewWrap.style.display = 'none';
  if (fileNameDisplay) fileNameDisplay.textContent = 'Upload or drop incident photo (optional)';
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
