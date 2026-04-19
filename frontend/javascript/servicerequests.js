/**
 * ServiceRequests – Provider Dashboard
 * Hardcoded request data: shows Name, Block, Contact, Problem.
 * Schedule is set by the provider in the detail modal.
 */

// ── Hardcoded Request Data ───────────────────────────────────────────────────
const REQUESTS = [
  {
    id: 'REQ-1001',
    title: 'Electrical — Fan Installation',
    status: 'pending',
    name: 'Aarav Sharma',
    contact: '+91 98200 11223',
    block: 'Block A-204, Skyline Residency',
    problem: 'Two ceiling fans need to be installed in the living room.',
    schedule: null,
  },
  {
    id: 'REQ-1002',
    title: 'Plumbing — Leak Repair',
    status: 'pending',
    name: 'Priya Mehta',
    contact: '+91 98765 43210',
    block: 'Villa 12, Green Acres',
    problem: 'Kitchen sink has a persistent water leak under the cabinet.',
    schedule: null,
  },
  {
    id: 'REQ-0988',
    title: 'AC Service — Deep Clean',
    status: 'in-progress',
    name: 'Rohan Kapoor',
    contact: '+91 99111 22334',
    block: 'Flat 7D, Orchid Towers',
    problem: 'Split AC unit requires full deep cleaning and gas refill.',
    schedule: '2026-04-23T11:00',
  },
  {
    id: 'REQ-0974',
    title: 'Carpentry — Door Hinge Fix',
    status: 'pending',
    name: 'Sunita Rao',
    contact: '+91 94567 88901',
    block: 'Block C-102, Palm Heights',
    problem: 'Main door hinge is broken and the door won\'t close properly.',
    schedule: null,
  },
  {
    id: 'REQ-0950',
    title: 'Painting — Bedroom Repaint',
    status: 'completed',
    name: 'Kiran Desai',
    contact: '+91 93400 12345',
    block: 'Apt 5B, Lotus Gardens',
    problem: 'Bedroom walls need a full repaint – two coats, off-white shade.',
    schedule: '2026-04-15T09:00',
  },
];

// ── State ────────────────────────────────────────────────────────────────────
let activeRequests = REQUESTS.map(r => ({ ...r }));
let openRequestId = null;

// ── DOM Ready ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCards(activeRequests);
  setupSearch();
  setupFilter();
  setupModalClose();
});

// ── Render Cards ─────────────────────────────────────────────────────────────
function renderCards(requests) {
  const list = document.getElementById('sr-requests-list');
  list.innerHTML = '';

  if (requests.length === 0) {
    list.innerHTML = `
      <div class="sr-empty">
        <i class="fas fa-inbox"></i>
        <p>No requests found.</p>
      </div>`;
    return;
  }

  requests.forEach(req => {
    const card = document.createElement('div');
    card.className = 'sr-card';
    card.dataset.id = req.id;

    const statusLabel = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed',
    }[req.status] || req.status;

    // Build action buttons based on status
    let actions = '';
    if (req.status === 'pending') {
      actions = `
        <button class="sr-btn-accept"  onclick="acceptRequest('${req.id}')"><i class="far fa-check-circle"></i> Accept</button>
        <button class="sr-btn-reject"  onclick="rejectRequest('${req.id}')"><i class="far fa-times-circle"></i> Reject</button>
        <button class="sr-btn-details" onclick="openModal('${req.id}')">Details</button>`;
    } else if (req.status === 'in-progress') {
      actions = `
        <button class="sr-btn-complete" onclick="completeRequest('${req.id}')"><i class="fas fa-check-circle"></i> Mark Completed</button>
        <button class="sr-btn-details"  onclick="openModal('${req.id}')">Details</button>`;
    } else {
      actions = `<button class="sr-btn-details" onclick="openModal('${req.id}')">Details</button>`;
    }

    card.innerHTML = `
      <div class="sr-card-left">
        <div class="sr-card-meta">
          <span class="sr-card-id">${req.id}</span>
          <span class="sr-badge ${req.status}">${statusLabel}</span>
        </div>
        <div class="sr-card-title">${req.title}</div>
        <div class="sr-card-info">
          <div class="sr-card-info-item"><i class="far fa-user"></i> ${req.name}</div>
          <div class="sr-card-info-item"><i class="fas fa-phone"></i> ${req.contact}</div>
          <div class="sr-card-info-item"><i class="fas fa-map-marker-alt"></i> ${req.block}</div>
          <div class="sr-card-info-item"><i class="fas fa-exclamation-circle"></i> ${req.problem.length > 45 ? req.problem.slice(0,45)+'…' : req.problem}</div>
        </div>
      </div>
      <div class="sr-card-actions">${actions}</div>`;

    list.appendChild(card);
  });
}

// ── Modal ────────────────────────────────────────────────────────────────────
function openModal(reqId) {
  const req = activeRequests.find(r => r.id === reqId);
  if (!req) return;
  openRequestId = reqId;

  const statusLabel = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed',
  }[req.status] || req.status;

  document.getElementById('modal-req-id').textContent   = req.id;
  document.getElementById('modal-title').textContent    = req.title;
  document.getElementById('modal-resident').textContent = req.name;
  document.getElementById('modal-phone').textContent    = req.contact;
  document.getElementById('modal-block').textContent    = req.block;
  document.getElementById('modal-problem').textContent  = req.problem;

  const statusEl = document.getElementById('modal-status');
  statusEl.textContent = statusLabel;
  statusEl.className   = `sr-status-badge ${req.status}`;

  // Schedule input
  const schedInput = document.getElementById('modal-schedule-input');
  schedInput.value = req.schedule || '';

  // Accept button visibility
  const acceptBtn = document.getElementById('sr-btn-accept-modal');
  acceptBtn.style.display = req.status === 'pending' ? 'flex' : 'none';

  document.getElementById('sr-modal-overlay').classList.add('active');
}

function closeModal() {
  // Save schedule value if provider set one
  if (openRequestId) {
    const schedInput = document.getElementById('modal-schedule-input');
    const idx = activeRequests.findIndex(r => r.id === openRequestId);
    if (idx !== -1 && schedInput.value) {
      activeRequests[idx].schedule = schedInput.value;
    }
  }
  document.getElementById('sr-modal-overlay').classList.remove('active');
  openRequestId = null;
}

function setupModalClose() {
  document.getElementById('sr-modal-close').addEventListener('click', closeModal);
  document.getElementById('sr-btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('sr-modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('sr-modal-overlay')) closeModal();
  });

  // Accept from modal
  document.getElementById('sr-btn-accept-modal').addEventListener('click', () => {
    if (openRequestId) {
      acceptRequest(openRequestId);
      closeModal();
    }
  });
}

// ── Actions ──────────────────────────────────────────────────────────────────
function acceptRequest(reqId) {
  const idx = activeRequests.findIndex(r => r.id === reqId);
  if (idx === -1) return;
  activeRequests[idx].status = 'in-progress';
  renderCards(getFilteredRequests());
  showToast(`Request ${reqId} accepted! Status → In Progress.`, 'success');
}

function rejectRequest(reqId) {
  const idx = activeRequests.findIndex(r => r.id === reqId);
  if (idx === -1) return;
  // Remove from list
  activeRequests.splice(idx, 1);
  renderCards(getFilteredRequests());
  showToast(`Request ${reqId} rejected and removed.`, 'error');
}

function completeRequest(reqId) {
  const idx = activeRequests.findIndex(r => r.id === reqId);
  if (idx === -1) return;
  activeRequests[idx].status = 'completed';
  renderCards(getFilteredRequests());
  showToast(`Request ${reqId} marked as Completed! ✓`, 'success');
}

// ── Search & Filter ──────────────────────────────────────────────────────────
function getFilteredRequests() {
  const query  = document.getElementById('sr-search').value.toLowerCase();
  const status = document.getElementById('sr-filter').value;

  return activeRequests.filter(req => {
    const matchStatus = status === 'all' || req.status === status;
    const matchQuery  = !query ||
      req.name.toLowerCase().includes(query) ||
      req.title.toLowerCase().includes(query) ||
      req.id.toLowerCase().includes(query) ||
      req.block.toLowerCase().includes(query);
    return matchStatus && matchQuery;
  });
}

function setupSearch() {
  document.getElementById('sr-search').addEventListener('input', () => {
    renderCards(getFilteredRequests());
  });
}

function setupFilter() {
  document.getElementById('sr-filter').addEventListener('change', () => {
    renderCards(getFilteredRequests());
  });
}

// ── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `sr-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

console.log('ServiceRequests – Provider Dashboard loaded');
