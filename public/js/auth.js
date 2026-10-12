// DisasterGuard - Authentication Client Handler

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Pre-fill demo button if present
  const fillDemoBtn = document.getElementById('btn-fill-demo');
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      if (emailInput && passInput) {
        emailInput.value = 'admin@disasterguard.org';
        passInput.value = 'admin123';
        showToast('Demo administrator credentials filled.', 'info');
      }
    });
  }
});

async function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  const submitBtn = document.getElementById('login-submit-btn');
  const errorBox = document.getElementById('login-error-msg');

  if (errorBox) {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  }

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passInput ? passInput.value : '';

  if (!email || !password) {
    if (errorBox) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Please enter both email and password.';
    }
    return;
  }

  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Sign In';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Authentication failed.');
    }

    // Save token and user details to localStorage
    localStorage.setItem('dg_auth_token', data.token);
    localStorage.setItem('dg_user', JSON.stringify(data.user));

    showToast('Login successful! Redirecting to Command Console...', 'success');

    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 800);
  } catch (err) {
    if (errorBox) {
      errorBox.style.display = 'block';
      errorBox.textContent = err.message || 'Login failed. Please verify credentials.';
    }
    showToast(err.message || 'Authentication failed.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// Global Logout function
function logoutAdmin() {
  localStorage.removeItem('dg_auth_token');
  localStorage.removeItem('dg_user');
  showToast('Logged out of Admin Session.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// Get auth token helper
function getAuthToken() {
  return localStorage.getItem('dg_auth_token');
}

// Check logged in admin helper
function getAdminUser() {
  const userJson = localStorage.getItem('dg_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}
