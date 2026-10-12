// DisasterGuard - Disaster Safety Guides & Emergency Checklist

const guidesData = {
  flood: {
    title: 'Flood Emergency Action Plan',
    icon: 'fa-water',
    color: '#2563EB',
    summary: 'Flash floods and rising waters can become life-threatening in minutes. Proper anticipation and swift vertical evacuation prevent tragedy.',
    before: [
      'Identify high-ground evacuation routes leading away from culverts and low dips.',
      'Elevate essential appliances, furnaces, and electrical panels above anticipated flood heights.',
      'Install check valves in plumbing to prevent floodwater backing up into interior drains.',
      'Prepare emergency sandbags around perimeter entry points if living in flood-prone basements.'
    ],
    during: [
      'Turn off electricity at the main breaker before water touches floor circuits.',
      'Move immediately to higher floors or designated high-ground emergency shelters.',
      'Never attempt to walk or drive through flowing water ("Turn Around, Don\'t Drown"). Just 6 inches of rapid water can knock a person down; 12 inches can sweep away a car.',
      'Stay tuned to DisasterGuard alerts and local emergency advisory radio.'
    ],
    after: [
      'Avoid wading through remaining standing floodwater which may be electrically charged or contaminated with sewage.',
      'Discard food items, medicines, and drinking containers exposed to floodwaters.',
      'Photograph all physical damage for relief grants and insurance documentation before cleanup.',
      'Ensure municipal clearance on tap water safety before drinking; boil tap water rigorously.'
    ]
  },
  cyclone: {
    title: 'Cyclone & Windstorm Safety Protocol',
    icon: 'fa-wind',
    color: '#0284C7',
    summary: 'Cyclones bring devastating gales, horizontal rain squalls, and storm surges. Secure your shelter early.',
    before: [
      'Trim weak tree branches hanging near roofs or overhead electrical connections.',
      'Board up or tape glass window panes and install storm shutters where possible.',
      'Anchor loose outdoor items: tin sheds, water tanks, bicycles, and patio furniture.',
      'Keep your vehicle fueled and parked in an enclosed garage away from tall trees.'
    ],
    during: [
      'Remain strictly indoors in the safest interior room without windows (e.g., hallway or bathroom).',
      'Unplug sensitive electrical equipment to avoid extreme lightning and surge spikes.',
      'Beware of the "Eye of the Storm": a sudden calm does not mean the cyclone is over; ferocious reverse winds follow rapidly.',
      'Do not venture outside until local civil authorities announce the all-clear.'
    ],
    after: [
      'Watch out for snapped live power cables hanging in puddles or shrubs.',
      'Report damaged electrical posts and gas pipeline leaks to emergency services.',
      'Wear sturdy shoes and leather gloves to avoid tetanus infections from scattered corrugated iron or broken glass.',
      'Check in on elderly neighbors or persons with mobility constraints.'
    ]
  },
  earthquake: {
    title: 'Earthquake Survival Protocol',
    icon: 'fa-house-crack',
    color: '#D97706',
    summary: 'Earthquakes occur without warning. Instant automatic muscle memory saves lives: Drop, Cover, and Hold On.',
    before: [
      'Secure heavy bookcases, mirrors, water heaters, and cupboards firmly to wall studs.',
      'Store breakable items and heavy objects on bottom shelves rather than elevated racks.',
      'Identify safe spots in each room: under sturdy desks, interior load-bearing walls.',
      'Practice "Drop, Cover, and Hold On" earthquake drills with family members.'
    ],
    during: [
      'DROP down onto your hands and knees immediately to prevent being knocked over.',
      'COVER your head and neck under a sturdy table or desk. If no shelter exists, crawl next to an interior wall.',
      'HOLD ON to your shelter until shaking stops. Protect your vital organs.',
      'If outdoors, move into an open area away from buildings, streetlights, and utility wires. If inside a high-rise, never use elevators.'
    ],
    after: [
      'Expect tremors and aftershocks within hours or days of the primary seismic event.',
      'Check for gas leaks: if you smell sulfur or gas, evacuate immediately and do not turn on electrical switches.',
      'Inspect structural foundation columns for deep through-and-through shear cracks.',
      'Extinguish small fires if safe to do so; fires are the leading secondary hazard of major quakes.'
    ]
  },
  fire: {
    title: 'Fire Safety & Smoke Evacuation',
    icon: 'fa-fire',
    color: '#DC2626',
    summary: 'Smoke is the primary cause of fire fatalities. Move quickly, crawl low beneath toxic smoke, and know two ways out.',
    before: [
      'Install certified smoke alarms on every level of the home and test batteries monthly.',
      'Keep multipurpose ABC dry-powder fire extinguishers near the kitchen and garage.',
      'Design and practice two escape routes out of every bedroom.',
      'Never overload multi-plug surge strips or run cords beneath floor carpets.'
    ],
    during: [
      'Crawl low on hands and knees beneath toxic smoke layer to reach the nearest exit.',
      'Feel closed doors with the back of your hand before opening: if warm to the touch, do not open.',
      'If clothes catch fire: STOP, DROP, and ROLL back and forth to smother flames.',
      'Once outside, STAY OUT. Never re-enter a burning structure for pets or possessions.'
    ],
    after: [
      'Seek immediate medical care for burns and smoke inhalation symptoms.',
      'Do not enter fire-damaged premises until the Fire Chief issues structural entry clearance.',
      'Discard food, medicine, and cosmetics exposed to heat, soot, and chemical fire retardants.',
      'Contact emergency relief agencies if temporary housing or emergency clothing is required.'
    ]
  },
  landslide: {
    title: 'Landslide & Mudflow Safety Guide',
    icon: 'fa-mountain',
    color: '#78350F',
    summary: 'Hill slope failures occur rapidly during intense rains or seismic shaking. Recognize ground clues early.',
    before: [
      'Observe hillsides for tilted trees, leaning utility poles, or newly appearing ground cracks.',
      'Consult geological risk maps before building on or near steep slopes.',
      'Install flexible pipe fittings that resist breakage during ground settling.',
      'Plant deep-rooted ground vegetation to stabilize topsoil erosion.'
    ],
    during: [
      'Listen for unusual sounds such as rumbling boulders, cracking trees, or sudden mudflow trickles.',
      'If near a stream or channel, be alert for sudden changes in water clarity (clear to muddy) or rapid discharge changes.',
      'Evacuate immediately away from the path of debris flow; move perpendicular to the slide direction.',
      'If trapped indoors with no escape route, curl into a tight ball under a sturdy desk to protect your head.'
    ],
    after: [
      'Stay away from the slide area; secondary slope slides frequently follow.',
      'Check for damaged gas, water, and sewage lines and notify emergency municipal departments.',
      'Watch for flash flooding that often occurs when mudflows block regional river channels.',
      'Report any newly appeared structural fractures in road pavements.'
    ]
  },
  heatwave: {
    title: 'Extreme Heatwave Protection Guide',
    icon: 'fa-sun',
    color: '#EA580C',
    summary: 'Prolonged high temperatures combined with humidity create severe physiological strain. Hydration and shade are paramount.',
    before: [
      'Check window air conditioners and fans; install reflective window shades.',
      'Stock adequate hydration supplies (water, oral rehydration salts, coconut water).',
      'Identify local air-conditioned public cooling centers, libraries, and shelters.',
      'Keep emergency medication stored below safe 25°C room thresholds.'
    ],
    during: [
      'Drink plenty of water throughout the day, even if not feeling thirsty. Avoid caffeinated or alcoholic drinks.',
      'Stay inside during peak solar intensity hours (11:30 AM to 4:00 PM).',
      'Wear loose, light-colored, breathable cotton clothing and wide-brimmed hats.',
      'Never leave children or pets unattended in parked vehicles, even for a moment.'
    ],
    after: [
      'Recognize heat exhaustion signs: profuse sweating, dizziness, nausea, headache.',
      'If someone exhibits Heat Stroke (confusion, high body temp, hot dry skin, unconsciousness), treat as a critical emergency and call 108/112 immediately.',
      'Apply cool wet towels to neck, armpits, and groin while awaiting emergency responders.',
      'Continue aggressive hydration and monitor vulnerable relatives.'
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initSafetyTabs();
  renderSafetyGuide('flood');
  initChecklist();
  initPrintButton();
});

function initSafetyTabs() {
  const tabs = document.querySelectorAll('.safety-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-cat') || 'flood';
      renderSafetyGuide(cat);
    });
  });
}

function renderSafetyGuide(cat) {
  const guide = guidesData[cat];
  const container = document.getElementById('safety-guide-display');
  if (!guide || !container) return;

  const renderList = (items, iconColor) => {
    return items.map(item => `
      <li>
        <i class="fas fa-check-circle" style="color:${iconColor};"></i>
        <span>${escapeHTML(item)}</span>
      </li>
    `).join('');
  };

  container.innerHTML = `
    <div class="safety-guide-card">
      <div style="display:flex; align-items:center; gap:14px; margin-bottom:12px;">
        <div style="
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: ${guide.color}1A;
          color: ${guide.color};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        ">
          <i class="fas ${guide.icon}"></i>
        </div>
        <div>
          <h2 style="font-size:1.6rem; font-weight:800; color:#14243A; margin:0;">${guide.title}</h2>
          <p style="color:#64748B; font-size:0.92rem; margin-top:2px;">${guide.summary}</p>
        </div>
      </div>

      <div class="phase-columns">
        <div class="phase-card before">
          <h3 class="phase-title"><i class="fas fa-calendar-check"></i> 1. BEFORE (Prepare)</h3>
          <ul class="phase-list">
            ${renderList(guide.before, '#2563EB')}
          </ul>
        </div>

        <div class="phase-card during">
          <h3 class="phase-title"><i class="fas fa-shield-halved"></i> 2. DURING (Survive)</h3>
          <ul class="phase-list">
            ${renderList(guide.during, '#DC2626')}
          </ul>
        </div>

        <div class="phase-card after">
          <h3 class="phase-title"><i class="fas fa-kit-medical"></i> 3. AFTER (Recover)</h3>
          <ul class="phase-list">
            ${renderList(guide.after, '#16A34A')}
          </ul>
        </div>
      </div>
    </div>
  `;
}

// Emergency Kit Interactive Checklist
const kitItems = [
  { id: 'kit-1', title: 'Drinking Water (1 gallon/person/day for 3 days)', icon: 'fa-bottle-water' },
  { id: 'kit-2', title: 'Non-Perishable Food (3-day non-cook supply)', icon: 'fa-utensils' },
  { id: 'kit-3', title: 'First-Aid Kit & Antiseptic Bandages', icon: 'fa-kit-medical' },
  { id: 'kit-4', title: 'High-Lumen Flashlight & Spare Batteries', icon: 'fa-flashlight' },
  { id: 'kit-5', title: 'Power Bank & Emergency USB Phone Cables', icon: 'fa-battery-full' },
  { id: 'kit-6', title: 'Essential Prescription Medicines & Dosage Chart', icon: 'fa-pills' },
  { id: 'kit-7', title: 'Waterproof Pouch with Important Documents (ID, Deeds)', icon: 'fa-folder-closed' },
  { id: 'kit-8', title: 'Sanitation Supplies, Wet Wipes & Heavy Garbage Bags', icon: 'fa-soap' },
  { id: 'kit-9', title: 'Emergency Contact Directory & Laminated Cards', icon: 'fa-address-book' }
];

function initChecklist() {
  const container = document.getElementById('checklist-items-grid');
  if (!container) return;

  // Retrieve saved checklist state from localStorage
  const savedState = JSON.parse(localStorage.getItem('dg_emergency_kit_state') || '{}');

  container.innerHTML = kitItems.map(item => {
    const isChecked = Boolean(savedState[item.id]);
    return `
      <div class="checklist-item ${isChecked ? 'checked' : ''}" data-id="${item.id}" id="item-wrap-${item.id}">
        <input type="checkbox" class="checklist-checkbox" id="${item.id}" ${isChecked ? 'checked' : ''} />
        <i class="fas ${item.icon}" style="color:#2563EB; font-size:1.1rem;"></i>
        <label for="${item.id}" style="cursor:pointer; flex:1; font-size:0.88rem; font-weight:500;">
          ${item.title}
        </label>
      </div>
    `;
  }).join('');

  updateChecklistProgress();

  // Attach event listeners
  kitItems.forEach(item => {
    const checkbox = document.getElementById(item.id);
    const wrapper = document.getElementById(`item-wrap-${item.id}`);

    if (checkbox && wrapper) {
      checkbox.addEventListener('change', () => {
        savedState[item.id] = checkbox.checked;
        localStorage.setItem('dg_emergency_kit_state', JSON.stringify(savedState));

        if (checkbox.checked) {
          wrapper.classList.add('checked');
        } else {
          wrapper.classList.remove('checked');
        }

        updateChecklistProgress();
      });
    }
  });

  // Reset checklist button
  const resetBtn = document.getElementById('btn-reset-checklist');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('dg_emergency_kit_state');
      initChecklist();
      showToast('Emergency kit checklist reset.', 'info');
    });
  }
}

function updateChecklistProgress() {
  const savedState = JSON.parse(localStorage.getItem('dg_emergency_kit_state') || '{}');
  const checkedCount = Object.values(savedState).filter(Boolean).length;
  const total = kitItems.length;
  const percentage = Math.round((checkedCount / total) * 100);

  const fillEl = document.getElementById('checklist-progress-fill');
  const labelEl = document.getElementById('checklist-count-label');

  if (fillEl) fillEl.style.width = `${percentage}%`;
  if (labelEl) labelEl.textContent = `${checkedCount} of ${total} Packed (${percentage}%)`;
}

function initPrintButton() {
  const printBtn = document.getElementById('btn-print-guide');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
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
