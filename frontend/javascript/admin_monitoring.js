// ── Data Store ────────────────────────────────────────────────────────────────
let bookings = [
    { id: 'BK-001', service: 'Leak Repair',    category: 'Plumbing',   resident: 'Sarah Mitchell', provider: "Mike's Plumbing",       date: '22 Apr 2026', time: '10:00 AM', address: 'Flat 12, Block A', status: 'approved',    notes: 'Urgent pipe burst in kitchen.' },
    { id: 'BK-002', service: 'Deep Clean',      category: 'Cleaning',   resident: 'James Carter',   provider: 'Crystal Cleaning Co.',  date: '22 Apr 2026', time: '02:00 PM', address: 'Unit 5, Block C',  status: 'in-progress', notes: 'Full apartment deep clean.' },
    { id: 'BK-003', service: 'Faucet Install',  category: 'Plumbing',   resident: 'Maria Lopez',    provider: "Mike's Plumbing",       date: '23 Apr 2026', time: '09:30 AM', address: 'Flat 8, Block B',  status: 'pending',     notes: 'Replace kitchen faucet.' },
    { id: 'BK-004', service: 'Window Wash',     category: 'Cleaning',   resident: 'Sarah Mitchell', provider: 'Crystal Cleaning Co.',  date: '23 Apr 2026', time: '11:00 AM', address: 'Flat 12, Block A', status: 'pending',     notes: 'Exterior window cleaning.' },
    { id: 'BK-005', service: 'Light Fixture',   category: 'Electrical', resident: 'Tom Green',      provider: 'Bright Sparks Ltd',     date: '21 Apr 2026', time: '03:00 PM', address: 'Flat 2, Block D',  status: 'completed',   notes: 'Install ceiling light in bedroom.' },
    { id: 'BK-006', service: 'Cabinet Repair',  category: 'Carpentry',  resident: 'Anne White',     provider: 'WoodWorks Co.',         date: '20 Apr 2026', time: '01:00 PM', address: 'Unit 9, Block E',  status: 'completed',   notes: 'Fix broken cabinet hinges.' },
    { id: 'BK-007', service: 'Drain Unblock',   category: 'Plumbing',   resident: 'David Kim',      provider: "Mike's Plumbing",       date: '19 Apr 2026', time: '08:00 AM', address: 'Flat 6, Block B',  status: 'cancelled',   notes: 'Blocked bathroom drain.' },
];

let activeTab = 'ongoing';
const ongoingStatuses   = ['pending', 'approved', 'in-progress'];
const completedStatuses = ['completed', 'cancelled'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getFilteredData() {
    const q  = document.getElementById('search-input').value.toLowerCase();
    const fs = document.getElementById('filter-status').value;
    const fc = document.getElementById('filter-service').value;

    const pool = activeTab === 'ongoing'
        ? bookings.filter(b => ongoingStatuses.includes(b.status))
        : bookings.filter(b => completedStatuses.includes(b.status));

    return pool.filter(b => {
        const matchQ = !q  || b.service.toLowerCase().includes(q) || b.resident.toLowerCase().includes(q) || b.provider.toLowerCase().includes(q);
        const matchS = !fs || b.status === fs;
        const matchC = !fc || b.category === fc;
        return matchQ && matchS && matchC;
    });
}

function statusBadge(status) {
    const map = {
        'pending':     ['badge-pending',     'PENDING'],
        'approved':    ['badge-approved',    'APPROVED'],
        'in-progress': ['badge-in-progress', 'IN PROGRESS'],
        'completed':   ['badge-completed',   'COMPLETED'],
        'cancelled':   ['badge-cancelled',   'CANCELLED'],
    };
    const [cls, label] = map[status] || ['badge-pending', status.toUpperCase()];
    return `<span class="badge-solid ${cls}" style="font-size:11px;">${label}</span>`;
}

function actionBtns(b) {
    let html = `<button class="btn-action btn-view" onclick="event.stopPropagation();openDetail('${b.id}')"><i class="fas fa-eye"></i> View</button>`;
    if (b.status === 'pending' || b.status === 'approved') {
        html += `<button class="btn-action btn-cancel"   onclick="event.stopPropagation();confirmAction('cancel','${b.id}')"><i class="fas fa-times"></i> Cancel</button>`;
        html += `<button class="btn-action btn-escalate" onclick="event.stopPropagation();confirmAction('escalate','${b.id}')"><i class="fas fa-arrow-up"></i> Escalate</button>`;
    }
    if (b.status === 'in-progress') {
        html += `<button class="btn-action btn-escalate" onclick="event.stopPropagation();confirmAction('escalate','${b.id}')"><i class="fas fa-flag"></i> Flag</button>`;
    }
    return html;
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
    updateStats();
    const data  = getFilteredData();
    const list  = document.getElementById('monitor-list');
    const count = document.getElementById('results-count');

    count.textContent = `Showing ${data.length} result${data.length !== 1 ? 's' : ''}`;

    if (!data.length) {
        list.innerHTML = `<div class="monitor-empty"><i class="fas fa-inbox"></i><p>No bookings match your filters.</p></div>`;
        return;
    }

    list.innerHTML = data.map(b => `
        <div class="monitor-item" onclick="openDetail('${b.id}')">
            <div class="monitor-item-left">
                <div class="monitor-icon"><i class="fas fa-bolt"></i></div>
                <div class="monitor-details">
                    <h4>${b.service}</h4>
                    <p>${b.resident} &bull; ${b.provider} &bull; ${b.date}</p>
                </div>
            </div>
            <div class="monitor-item-right">
                ${statusBadge(b.status)}
                ${actionBtns(b)}
            </div>
        </div>`).join('');
}

function updateStats() {
    document.getElementById('stat-pending').textContent    = bookings.filter(b => b.status === 'pending').length;
    document.getElementById('stat-inprogress').textContent = bookings.filter(b => b.status === 'in-progress').length;
    document.getElementById('stat-completed').textContent  = bookings.filter(b => b.status === 'completed').length;
    document.getElementById('stat-cancelled').textContent  = bookings.filter(b => b.status === 'cancelled').length;
}

// ── Tab Switch ────────────────────────────────────────────────────────────────
function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tab-ongoing').classList.toggle('active', tab === 'ongoing');
    document.getElementById('tab-completed').classList.toggle('active', tab === 'completed');
    document.getElementById('filter-status').value = '';
    render();
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function openDetail(id) {
    const b = bookings.find(x => x.id === id);
    if (!b) return;

    document.getElementById('modal-service-name').textContent = b.service;
    document.getElementById('modal-booking-id').textContent   = `Booking ID: ${b.id}  •  ${b.category}`;
    document.getElementById('modal-rows').innerHTML = `
        <div class="modal-row"><span>Resident</span><span>${b.resident}</span></div>
        <div class="modal-row"><span>Provider</span><span>${b.provider}</span></div>
        <div class="modal-row"><span>Date &amp; Time</span><span>${b.date} at ${b.time}</span></div>
        <div class="modal-row"><span>Address</span><span>${b.address}</span></div>
        <div class="modal-row"><span>Status</span><span>${statusBadge(b.status)}</span></div>
        <div class="modal-row"><span>Notes</span><span style="color:#aaa;font-style:italic;">${b.notes}</span></div>`;

    let btns = `<button class="btn-action btn-view" style="padding:8px 18px;" onclick="closeModal('detail-modal')">Close</button>`;
    if (b.status === 'pending' || b.status === 'approved') {
        btns += `<button class="btn-action btn-cancel"   style="padding:8px 18px;" onclick="closeModal('detail-modal');confirmAction('cancel','${b.id}')">Cancel Booking</button>`;
        btns += `<button class="btn-action btn-escalate" style="padding:8px 18px;" onclick="closeModal('detail-modal');confirmAction('escalate','${b.id}')">Escalate</button>`;
    }
    if (b.status === 'in-progress') {
        btns += `<button class="btn-action btn-escalate" style="padding:8px 18px;" onclick="closeModal('detail-modal');confirmAction('escalate','${b.id}')">Flag Issue</button>`;
    }
    document.getElementById('modal-action-btns').innerHTML = btns;
    openModal('detail-modal');
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function confirmAction(action, id) {
    const b = bookings.find(x => x.id === id);
    if (!b) return;

    const isCancel = action === 'cancel';
    document.getElementById('confirm-icon').innerHTML  = isCancel
        ? '<i class="fas fa-times-circle" style="color:#e74c3c;"></i>'
        : '<i class="fas fa-exclamation-triangle" style="color:#f1c40f;"></i>';
    document.getElementById('confirm-title').textContent = isCancel ? 'Cancel Booking?' : 'Escalate Booking?';
    document.getElementById('confirm-msg').textContent   = isCancel
        ? `Are you sure you want to cancel "${b.service}" for ${b.resident}? This cannot be undone.`
        : `Escalate "${b.service}" for ${b.resident} to management for urgent attention?`;

    const okBtn = document.getElementById('confirm-ok-btn');
    okBtn.textContent        = isCancel ? 'Yes, Cancel' : 'Yes, Escalate';
    okBtn.style.background   = isCancel ? '#e74c3c' : '#f1c40f';
    okBtn.style.color        = isCancel ? '#fff'    : '#000';
    okBtn.onclick            = () => executeAction(action, id);
    openModal('confirm-modal');
}

function executeAction(action, id) {
    closeModal('confirm-modal');
    const b = bookings.find(x => x.id === id);
    if (!b) return;
    if (action === 'cancel') {
        b.status = 'cancelled';
        showToast('Booking cancelled successfully.', 'error');
    } else {
        showToast(`Booking "${b.service}" flagged for management review.`, 'warning');
    }
    render();
}

// ── Refresh ───────────────────────────────────────────────────────────────────
function handleRefresh() {
    const btn = document.getElementById('btn-refresh');
    btn.classList.add('spinning');
    setTimeout(() => {
        btn.classList.remove('spinning');
        render();
        showToast('Data refreshed.', 'success');
    }, 900);
}

// ── Modals ────────────────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    const t     = document.getElementById('toast');
    const icons = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle' };
    t.className = `toast ${type}`;
    document.getElementById('toast-icon').className = `fas ${icons[type] || 'fa-info-circle'}`;
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-input').addEventListener('input',  render);
    document.getElementById('filter-status').addEventListener('change', render);
    document.getElementById('filter-service').addEventListener('change', render);

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(el => {
        el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
    });

    render();
});
