/**
 * ServiceRequests – Provider Dashboard
 * Dynamically fetches requests from the backend.
 */

let activeRequests = [];
let openRequestId = null;

// ── DOM Ready ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    fetchRequests();
    setupSearch();
    setupFilter();
    setupModalClose();
});

// ── Fetch Requests ───────────────────────────────────────────────────────────
async function fetchRequests() {
    const list = document.getElementById('sr-requests-list');
    list.innerHTML = '<div style="text-align:center; padding: 40px; color: #888;">Fetching requests...</div>';

    const userId = parseInt(sessionStorage.getItem('userId'));
    const userRole = sessionStorage.getItem('userRole') || ''; 
    const providerTrade = userRole.replace('Provider: ', '').trim();

    try {
        const response = await fetch('http://127.0.0.1:5000/bookings');
        if (!response.ok) throw new Error('Server error');
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            activeRequests = [];
        } else {
            // Filter: Pending requests for this trade, OR assigned work for this provider
            const filteredData = data.filter(req => {
                if (req.status === 'pending') {
                    return req.service_name === providerTrade;
                } else {
                    return req.provider_id == userId;
                }
            });

            activeRequests = filteredData.map(req => {
                let displayLocation = "";
                let apt = req.apartment_id || "";
                
                if (apt.includes('|')) {
                    const parts = apt.split('|');
                    displayLocation = `Block ${parts[0]} - Flat ${parts[1]}`;
                } else if (apt.includes('-')) {
                    const parts = apt.split('-');
                    displayLocation = `Block ${parts[0]} - Flat ${parts[1]}`;
                } else {
                    displayLocation = apt || 'N/A';
                }

                return {
                    id: req.id.toString(),
                    title: req.service_name || 'Service Request',
                    status: req.status,
                    name: req.resident_name || `Resident #${req.resident_id}`,
                    contact: req.mobile_number || 'N/A',
                    block: displayLocation,
                    problem: req.problem_description || 'No description provided',
                    priority: req.priority || 'medium',
                    date: req.preferred_date || 'N/A',
                    time: req.preferred_time || 'N/A'
                };
            });
        }
        renderCards(activeRequests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        activeRequests = [];
        renderCards([]); // Show the "No requests found" UI even on error
    }
}

// ── Render Cards ─────────────────────────────────────────────────────────────
function renderCards(requests) {
    const list = document.getElementById('sr-requests-list');
    list.innerHTML = '';

    if (!requests || requests.length === 0) {
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
            'accepted': 'Accepted',
            'in-progress': 'In Progress',
            'completed': 'Completed',
        }[req.status] || req.status;

        // Build action buttons based on status
        let actions = '';
        if (req.status === 'pending') {
            actions = `
                <button class="sr-btn-accept"  onclick="updateStatus('${req.id}', 'accepted')"><i class="far fa-check-circle"></i> Accept</button>
                <button class="sr-btn-reject"  onclick="updateStatus('${req.id}', 'rejected')"><i class="far fa-times-circle"></i> Reject</button>
                <button class="sr-btn-details" onclick="openModal('${req.id}')">Details</button>`;
        } else if (req.status === 'accepted' || req.status === 'in-progress') {
            actions = `
                <button class="sr-btn-complete" onclick="updateStatus('${req.id}', 'completed')"><i class="fas fa-check-circle"></i> Mark Completed</button>
                <button class="sr-btn-details"  onclick="openModal('${req.id}')">Details</button>`;
        } else {
            actions = `<button class="sr-btn-details" onclick="openModal('${req.id}')">Details</button>`;
        }

        card.innerHTML = `
            <div class="sr-card-left">
                <div class="sr-card-meta">
                    <span class="sr-card-id">#${req.id}</span>
                    <span class="sr-badge ${req.status}">${statusLabel}</span>
                </div>
                <div class="sr-card-title" style="display: flex; align-items: center; gap: 10px;">
                    ${req.title}
                    <span style="font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase; background: ${
                        req.priority === 'critical' ? '#e74c3c' : 
                        req.priority === 'high' ? '#e67e22' : 
                        req.priority === 'medium' ? '#3498db' : '#2ecc71'
                    }; color: white;">${req.priority}</span>
                </div>
                <div class="sr-card-info">
                    <div class="sr-card-info-item"><i class="far fa-user"></i> ${req.name}</div>
                    <div class="sr-card-info-item"><i class="fas fa-map-marker-alt"></i> ${req.block}</div>
                    <div class="sr-card-info-item"><i class="fas fa-exclamation-circle"></i> ${req.problem.length > 45 ? req.problem.slice(0, 45) + '…' : req.problem}</div>
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
        'accepted': 'Accepted',
        'in-progress': 'In Progress',
        'completed': 'Completed',
    }[req.status] || req.status;

    document.getElementById('modal-req-id').textContent = '#' + req.id;
    document.getElementById('modal-title').textContent = req.title;
    document.getElementById('modal-resident').textContent = req.name;
    document.getElementById('modal-phone').textContent = req.contact;
    document.getElementById('modal-block').textContent = req.block;
    document.getElementById('modal-priority').textContent = req.priority.toUpperCase();
    document.getElementById('modal-date').textContent = req.date;
    document.getElementById('modal-time').textContent = req.time;
    document.getElementById('modal-problem').textContent = req.problem;

    const statusEl = document.getElementById('modal-status');
    statusEl.textContent = statusLabel;
    statusEl.className = `sr-status-badge ${req.status}`;

    // Accept button visibility
    const acceptBtn = document.getElementById('sr-btn-accept-modal');
    if (acceptBtn) acceptBtn.style.display = req.status === 'pending' ? 'flex' : 'none';

    document.getElementById('sr-modal-overlay').classList.add('active');
}

function closeModal() {
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
    const acceptModalBtn = document.getElementById('sr-btn-accept-modal');
    if (acceptModalBtn) {
        acceptModalBtn.addEventListener('click', () => {
            if (openRequestId) {
                updateStatus(openRequestId, 'accepted');
                closeModal();
            }
        });
    }
}

// ── Actions ──────────────────────────────────────────────────────────────────
async function updateStatus(bookingId, newStatus) {
    const providerId = sessionStorage.getItem('userId');
    try {
        const response = await fetch('http://localhost:5000/update-status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                booking_id: bookingId, 
                status: newStatus,
                provider_id: providerId 
            })
        });

        const result = await response.json();
        if (result.status === 'updated') {
            showToast(`Status updated to ${newStatus}!`, 'success');
            fetchRequests(); // Refresh list
        } else {
            console.error('Update failed:', result.message);
            showToast(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Failed to update status. Check console for details.', 'error');
    }
}

// ── Search & Filter ──────────────────────────────────────────────────────────
function getFilteredRequests() {
    const query = document.getElementById('sr-search').value.toLowerCase();
    const status = document.getElementById('sr-filter').value;

    return activeRequests.filter(req => {
        const matchStatus = status === 'all' || req.status === status;
        const matchQuery = !query ||
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
