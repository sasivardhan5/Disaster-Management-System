// DisasterGuard - Interactive Live Map Script (Leaflet & OpenStreetMap)

let mapInstance = null;
let markersLayer = null;
let allMapPoints = [];
let userLocationMarker = null;

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadMapData();
  initMapControls();
});

function initMap() {
  const mapElement = document.getElementById('disaster-map');
  if (!mapElement) return;

  try {
    // Default center (Hyderabad demo coordinates)
    const defaultCenter = [17.4065, 78.4772];
    const defaultZoom = 12;

    mapInstance = L.map('disaster-map', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView(defaultCenter, defaultZoom);

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | DisasterGuard Demo'
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);
  } catch (err) {
    console.error('Failed to initialize Leaflet Map:', err);
    mapElement.innerHTML = `
      <div style="padding:40px; text-align:center; color:#DC2626;">
        <i class="fas fa-map-marked" style="font-size:3rem; margin-bottom:12px;"></i>
        <h3>Interactive Map Loading Error</h3>
        <p>Could not load Leaflet map tiles. Please check internet connection or script dependencies.</p>
      </div>
    `;
  }
}

async function loadMapData() {
  try {
    const res = await fetch('/api/map/points');
    const result = await res.json();
    allMapPoints = result.data || [];

    // Render points on map
    renderMarkers('All');
    updateCategoryCounts();

    // Check if query param exists (e.g., map.html?focus=lat,lng)
    const urlParams = new URLSearchParams(window.location.search);
    const focusLat = parseFloat(urlParams.get('lat'));
    const focusLng = parseFloat(urlParams.get('lng'));
    if (!isNaN(focusLat) && !isNaN(focusLng) && mapInstance) {
      mapInstance.setView([focusLat, focusLng], 14);
    }
  } catch (err) {
    console.error('Error fetching map points:', err);
    showToast('Failed to load map coordinate markers.', 'error');
  }
}

function createCustomPin(category) {
  let color = '#DC2626'; // Disaster red
  let iconClass = 'fa-triangle-exclamation';

  if (category === 'Shelters') {
    color = '#2563EB'; // Blue
    iconClass = 'fa-campground';
  } else if (category === 'Hospitals') {
    color = '#16A34A'; // Green
    iconClass = 'fa-hospital';
  } else if (category === 'Emergency services') {
    color = '#EA580C'; // Orange
    iconClass = 'fa-shield-halved';
  } else if (category === 'Incidents') {
    color = '#B91C1C';
    iconClass = 'fa-fire-flame-curved';
  }

  const html = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      border: 2px solid #FFFFFF;
    ">
      <i class="fas ${iconClass}" style="
        transform: rotate(45deg);
        color: #FFFFFF;
        font-size: 13px;
      "></i>
    </div>
  `;

  return L.divIcon({
    className: 'custom-map-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28]
  });
}

function renderMarkers(categoryFilter = 'All', searchTerm = '') {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  const term = searchTerm.toLowerCase();

  const filtered = allMapPoints.filter(p => {
    // Match Category
    let matchCat = true;
    if (categoryFilter !== 'All') {
      if (categoryFilter === 'Disasters') {
        matchCat = p.category === 'Disasters' || p.category === 'Incidents';
      } else {
        matchCat = p.category === categoryFilter;
      }
    }

    // Match Search
    let matchSearch = true;
    if (term) {
      matchSearch = (p.title && p.title.toLowerCase().includes(term)) ||
                    (p.location && p.location.toLowerCase().includes(term)) ||
                    (p.subType && p.subType.toLowerCase().includes(term));
    }

    return matchCat && matchSearch;
  });

  let targetMarkerToOpen = null;
  const urlParams = new URLSearchParams(window.location.search);
  const focusLat = parseFloat(urlParams.get('lat'));
  const focusLng = parseFloat(urlParams.get('lng'));

  filtered.forEach(p => {
    if (p.lat && p.lng) {
      const pin = createCustomPin(p.category);
      const marker = L.marker([p.lat, p.lng], { icon: pin });

      const popupContent = buildPopupHTML(p);
      marker.bindPopup(popupContent);
      markersLayer.addLayer(marker);

      if (!isNaN(focusLat) && !isNaN(focusLng)) {
        if (Math.abs(p.lat - focusLat) < 0.005 && Math.abs(p.lng - focusLng) < 0.005) {
          targetMarkerToOpen = marker;
        }
      }
    }
  });

  if (targetMarkerToOpen && mapInstance) {
    mapInstance.setView([focusLat, focusLng], 15);
    setTimeout(() => targetMarkerToOpen.openPopup(), 300);
  } else if (filtered.length > 0 && mapInstance && !window.location.search.includes('lat=')) {
    const group = new L.featureGroup(markersLayer.getLayers());
    mapInstance.fitBounds(group.getBounds().pad(0.1));
  }
}

function buildPopupHTML(point) {
  let catBadgeColor = '#DC2626';
  if (point.category === 'Shelters') catBadgeColor = '#2563EB';
  if (point.category === 'Hospitals') catBadgeColor = '#16A34A';
  if (point.category === 'Emergency services') catBadgeColor = '#EA580C';

  let extraHtml = '';
  if (point.severity) {
    extraHtml += `<div><strong>Severity:</strong> <span style="font-weight:700;">${point.severity}</span></div>`;
  }
  if (point.availableBeds !== undefined && point.availableBeds !== null) {
    extraHtml += `<div><strong>Available Beds:</strong> ${point.availableBeds} / ${point.capacity}</div>`;
  }
  if (point.emergencyContact) {
    extraHtml += `<div><strong>Hotline:</strong> <span style="color:#2563EB; font-weight:700;">${point.emergencyContact}</span></div>`;
  }
  if (point.facilities && Array.isArray(point.facilities)) {
    extraHtml += `<div style="margin-top:4px;"><strong>Facilities:</strong> ${point.facilities.slice(0, 3).join(', ')}...</div>`;
  }

  return `
    <div class="map-popup-card">
      <span class="map-popup-category" style="color: ${catBadgeColor};">${point.category} &bull; ${point.subType || ''}</span>
      <h4 class="map-popup-title">${escapeHTML(point.title)}</h4>
      <div class="map-popup-loc"><i class="fas fa-location-dot"></i> ${escapeHTML(point.location)}</div>
      <div style="font-size:0.8rem; background:#F8FAFC; padding:6px 10px; border-radius:6px; margin-bottom:8px; border:1px solid #E2E8F0;">
        <div><strong>Status:</strong> ${point.status || 'Active'}</div>
        ${extraHtml}
      </div>
      ${point.description ? `<p class="map-popup-desc">${escapeHTML(point.description)}</p>` : ''}
      <div style="font-size:0.7rem; color:#94A3B8; font-style:italic; margin-top:6px;">
        Sample demo marker (${point.lat.toFixed(4)}, ${point.lng.toFixed(4)})
      </div>
    </div>
  `;
}

function updateCategoryCounts() {
  const getCount = (cat) => {
    if (cat === 'Disasters') {
      return allMapPoints.filter(p => p.category === 'Disasters' || p.category === 'Incidents').length;
    }
    return allMapPoints.filter(p => p.category === cat).length;
  };

  const countAll = document.getElementById('count-all');
  const countDisasters = document.getElementById('count-disasters');
  const countShelters = document.getElementById('count-shelters');
  const countHospitals = document.getElementById('count-hospitals');
  const countEms = document.getElementById('count-ems');

  if (countAll) countAll.textContent = allMapPoints.length;
  if (countDisasters) countDisasters.textContent = getCount('Disasters');
  if (countShelters) countShelters.textContent = getCount('Shelters');
  if (countHospitals) countHospitals.textContent = getCount('Hospitals');
  if (countEms) countEms.textContent = getCount('Emergency services');
}

function initMapControls() {
  // Category Pill Buttons
  const pills = document.querySelectorAll('.map-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-cat') || 'All';
      const search = document.getElementById('map-search-input')?.value || '';
      renderMarkers(cat, search);
    });
  });

  // Map Search Input
  const searchInput = document.getElementById('map-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const activePill = document.querySelector('.map-pill.active');
      const cat = activePill ? activePill.getAttribute('data-cat') : 'All';
      renderMarkers(cat, searchInput.value);
    });
  }

  // Geolocation "Locate Me" Button
  const locateBtn = document.getElementById('btn-locate-me');
  if (locateBtn) {
    locateBtn.addEventListener('click', handleLocateMe);
  }

  // Reset View Button
  const resetBtn = document.getElementById('btn-reset-map');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (mapInstance) {
        mapInstance.setView([17.4065, 78.4772], 12);
      }
    });
  }
}

// User Geolocation Handling
function handleLocateMe() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'warning');
    return;
  }

  showToast('Requesting GPS location access...', 'info');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (mapInstance) {
        mapInstance.setView([lat, lng], 14);

        if (userLocationMarker) {
          mapInstance.removeLayer(userLocationMarker);
        }

        const userIcon = L.divIcon({
          className: 'user-pin',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background-color: #2563EB;
              border: 3px solid #FFFFFF;
              border-radius: 50%;
              box-shadow: 0 0 12px #2563EB;
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        userLocationMarker = L.marker([lat, lng], { icon: userIcon })
          .addTo(mapInstance)
          .bindPopup('<strong>Your Current Location</strong><br>GPS coordinates identified.')
          .openPopup();

        showToast('Map centered on your current position.', 'success');
      }
    },
    (err) => {
      console.warn('Geolocation permission denied or timed out:', err);
      showToast('Location permission denied or unavailable. You can navigate the map manually.', 'warning');
    },
    { timeout: 10000, enableHighAccuracy: false }
  );
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
