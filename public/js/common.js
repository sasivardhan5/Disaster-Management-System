// DisasterGuard - Common Global Utilities & Navigation Handlers

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  checkAuthNavState();
  initEmergencyModal();
});

// Mobile Hamburger Navigation
function initNavbar() {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = hamburger.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  // Highlight active page
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const link = item.querySelector('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }
  });
}

// Adjust Login / Admin nav link based on local auth state
function checkAuthNavState() {
  const token = localStorage.getItem('dg_auth_token');
  const authNav = document.getElementById('nav-auth-item');

  if (authNav) {
    if (token) {
      authNav.innerHTML = `
        <a href="admin.html" class="nav-admin-link">
          <i class="fas fa-shield-alt"></i> Admin Console
        </a>
      `;
    } else {
      authNav.innerHTML = `
        <a href="login.html">
          <i class="fas fa-user-lock"></i> Admin Login
        </a>
      `;
    }
  }
}

// Toast Notification Manager
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-exclamation-triangle';
  if (type === 'warning') iconClass = 'fa-bell';

  toast.innerHTML = `
    <i class="fas ${iconClass} toast-icon"></i>
    <div class="toast-msg">${message}</div>
    <button style="background:none;border:none;color:#94a3b8;cursor:pointer;padding:2px;" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

// Format ISO timestamp to readable format
function formatDate(isoStr) {
  if (!isoStr) return 'N/A';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoStr;
  }
}

// Emergency Contacts Quick Modal
function initEmergencyModal() {
  const contactButtons = document.querySelectorAll('.open-emergency-contacts');
  contactButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openEmergencyModal();
    });
  });
}

function openEmergencyModal() {
  let modal = document.getElementById('emergency-contacts-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'emergency-contacts-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3><i class="fas fa-phone-volume text-danger"></i> Emergency Hotlines & Contacts</h3>
          <button class="modal-close-btn" onclick="closeEmergencyModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="emergency-callout-box" style="margin-bottom:16px;">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
              <h4>Critical Emergency Protocol</h4>
              <p>For immediate life-threatening perils, directly dial national or regional emergency dispatch numbers.</p>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
              <strong style="display:block; font-size:0.85rem; color:#64748b;">National Emergency Central</strong>
              <span style="font-size:1.2rem; font-weight:800; color:#dc2626;">112</span>
            </div>
            <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
              <strong style="display:block; font-size:0.85rem; color:#64748b;">Medical Ambulance</strong>
              <span style="font-size:1.2rem; font-weight:800; color:#2563eb;">108</span>
            </div>
            <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
              <strong style="display:block; font-size:0.85rem; color:#64748b;">Fire & Disaster Rescue</strong>
              <span style="font-size:1.2rem; font-weight:800; color:#ea580c;">101</span>
            </div>
            <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
              <strong style="display:block; font-size:0.85rem; color:#64748b;">Disaster Response Control</strong>
              <span style="font-size:1.2rem; font-weight:800; color:#16a34a;">1070 / 1077</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeEmergencyModal()">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.classList.add('active');
}

function closeEmergencyModal() {
  const modal = document.getElementById('emergency-contacts-modal');
  if (modal) modal.classList.remove('active');
}
