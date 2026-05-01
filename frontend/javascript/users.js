const API_BASE_URL = 'http://127.0.0.1:5000';
let residentsData = {};

document.addEventListener('DOMContentLoaded', function () {
    const wrap = document.getElementById('overlayWrap');
    const closeTab = document.getElementById('closeTab');
    const searchInput = document.getElementById('residentSearch');
    const residentsGrid = document.getElementById('residentsGrid');

    // Fetch residents from API
    async function loadResidents() {
        try {
            const response = await fetch(`${API_BASE_URL}/residents`);
            const data = await response.json();
            if (data.residents) {
                residentsData = {};
                data.residents.forEach(res => {
                    residentsData[res.id] = res;
                });
                renderResidentCards();
            }
        } catch (error) {
            console.error('Error loading residents:', error);
        }
    }

    function renderResidentCards() {
        residentsGrid.innerHTML = '';
        Object.values(residentsData).forEach(res => {
            const card = document.createElement('div');
            card.className = 'resident-card';
            card.dataset.id = res.id;
            
            const initials = res.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
            const statusClass = res.status.toLowerCase();
            const avatarClass = res.status === 'suspended' ? 'res-avatar inactive-av' : 'res-avatar';

            let cardActions = '';
            if (res.status === 'pending') {
                cardActions = `
                    <div class="card-actions" style="display: flex; gap: 8px;">
                        <button class="btn-approve" data-id="${res.id}" style="flex: 1; background: var(--orange, #ff8c00); color: black; border: none; padding: 10px; border-radius: 4px; font-weight: 700; cursor: pointer; transition: 0.2s;"><i class="fas fa-check"></i> APPROVE</button>
                        <button class="btn-reject" data-id="${res.id}" style="flex: 1; background: transparent; border: 1px solid #e74c3c; color: #e74c3c; padding: 10px; border-radius: 4px; font-weight: 700; cursor: pointer; transition: 0.2s;"><i class="fas fa-times"></i> REJECT</button>
                    </div>
                `;
            } else if (res.status === 'suspended') {
                cardActions = `
                    <div class="card-actions" style="display: flex; gap: 8px;">
                        <button class="btn-approve" data-id="${res.id}" style="flex: 1; background: var(--orange, #ff8c00); color: black; border: none; padding: 10px; border-radius: 4px; font-weight: 700; cursor: pointer; transition: 0.2s;"><i class="fas fa-check"></i> APPROVE</button>
                        <button class="btn-delete" data-id="${res.id}" data-name="${res.name}" style="flex: 1; background: #e74c3c; color: white; border: none; padding: 10px; border-radius: 4px; font-weight: 700; cursor: pointer; transition: 0.2s;"><i class="fas fa-trash"></i> DELETE</button>
                    </div>
                `;
            } else {
                cardActions = `
                    <div class="card-actions">
                        <button class="btn-msg" data-id="${res.id}" data-name="${res.name}"><i class="far fa-envelope"></i> MESSAGE</button>
                        <button class="btn-rem">VIEW DETAILS</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="card-status ${statusClass}">${res.status.toUpperCase()}</div>
                <div class="res-avatar-row">
                    <div class="${avatarClass}">${initials}</div>
                    <div>
                        <div class="res-name">${res.name}</div>
                        <div class="res-flat">FLAT ${res.apartment_id || 'N/A'}</div>
                    </div>
                </div>
                <div class="res-email"><i class="far fa-envelope"></i> ${res.email}</div>
                <div class="res-phone"><i class="fas fa-phone-alt"></i> ${res.phone || 'N/A'}</div>
                <div class="res-stats">
                    <span>Bookings: <b>${res.total_bookings || 0}</b></span>
                </div>
                
                ${cardActions}
            `;
            
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-msg')) {
                    e.stopPropagation();
                    const btn = e.target.closest('.btn-msg');
                    openMessageModal(btn.dataset.name, btn.dataset.id);
                    return;
                }
                if (e.target.closest('.btn-approve')) {
                    e.stopPropagation();
                    const btn = e.target.closest('.btn-approve');
                    updateStatus(btn.dataset.id, 'approved');
                    return;
                }
                if (e.target.closest('.btn-reject')) {
                    e.stopPropagation();
                    const btn = e.target.closest('.btn-reject');
                    updateStatus(btn.dataset.id, 'rejected');
                    return;
                }
                if (e.target.closest('.btn-delete')) {
                    e.stopPropagation();
                    const btn = e.target.closest('.btn-delete');
                    openRemoveModal(btn.dataset.name, btn.dataset.id);
                    return;
                }
                openDetailPanel(res.id);
            });
            residentsGrid.appendChild(card);
        });
    }

    function openDetailPanel(id) {
        const res = residentsData[id];
        if (!res) return;

        const initials = res.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        document.getElementById('dAvatar').textContent = initials;
        document.getElementById('dName').textContent = res.name;
        document.getElementById('dSub').textContent = 'Resident \u00b7 Flat ' + (res.apartment_id || 'N/A');
        document.getElementById('dRoom').textContent = res.apartment_id || 'N/A';
        document.getElementById('dEmail').textContent = res.email;
        document.getElementById('dPhone').textContent = res.phone || 'N/A';
        document.getElementById('dBookings').textContent = res.total_bookings || 0;
        
        // Joined date from created_at
        const joinedDate = res.created_at ? new Date(res.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
        document.getElementById('dMovein').textContent = joinedDate;

        const badge = document.getElementById('dBadge');
        badge.textContent = res.status.toUpperCase();
        badge.className = 'd-badge ' + res.status;

        // Clear hardcoded recent bookings for now
        const recentBookingsList = document.querySelector('.bk-item')?.parentElement;
        if (recentBookingsList) {
            recentBookingsList.innerHTML = '<p style="color: #666; font-size: 13px; padding: 10px 0;">No recent bookings found.</p>';
        }

        const footer = document.querySelector('.d-footer');
        footer.innerHTML = '';
        
        if (res.status === 'pending') {
            const approveBtn = document.createElement('button');
            approveBtn.className = 'd-btn-approve';
            approveBtn.style.cssText = 'flex: 1; background: var(--orange); border: none; color: #000; padding: 12px; border-radius: 4px; cursor: pointer; font-weight: 700;';
            approveBtn.innerHTML = '<i class="fas fa-check"></i> APPROVE ACCOUNT';
            approveBtn.onclick = () => updateStatus(res.id, 'approved');
            footer.appendChild(approveBtn);
        } else {
            const suspendBtn = document.createElement('button');
            suspendBtn.className = 'd-btn-del';
            suspendBtn.style.flex = "1";
            suspendBtn.innerHTML = res.status === 'active' ? '<i class="fas fa-ban"></i> SUSPEND ACCOUNT' : '<i class="fas fa-check"></i> ACTIVATE ACCOUNT';
            suspendBtn.onclick = () => updateStatus(res.id, res.status === 'active' ? 'suspended' : 'active');
            footer.appendChild(suspendBtn);
        }

        const msgBtn = document.createElement('button');
        msgBtn.className = 'd-btn-msg';
        msgBtn.style.flex = "1";
        msgBtn.innerHTML = '<i class="far fa-envelope"></i> MESSAGE';
        msgBtn.onclick = () => openMessageModal(res.name, res.id);
        footer.appendChild(msgBtn);

        wrap.classList.add('open');
    }

    async function updateStatus(id, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/update-resident-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resident_id: id, status: status })
            });
            if (response.ok) {
                wrap.classList.remove('open');
                loadResidents();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    async function deleteResident(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/resident/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                showCustomToast('Resident deleted successfully!', 'success');
                loadResidents();
            } else {
                showCustomToast('Failed to delete resident.', 'error');
            }
        } catch (error) {
            console.error('Error deleting resident:', error);
            showCustomToast('Error deleting resident.', 'error');
        }
    }

    // Initialize
    loadResidents();

    // Close button
    if(closeTab) closeTab.addEventListener('click', () => wrap.classList.remove('open'));

    // Search logic
    if(searchInput) {
        searchInput.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            document.querySelectorAll('.resident-card').forEach(card => {
                const name = residentsData[card.dataset.id].name.toLowerCase();
                card.style.display = name.includes(term) ? '' : 'none';
            });
        });
    }

    // Modal Logic (Message)
    const msgModal = document.getElementById('messageModal');
    let currentMessageTargetId = null;

    function openMessageModal(name, id) {
        document.getElementById('msgTargetName').textContent = name;
        currentMessageTargetId = id;
        document.getElementById('msgSubject').value = '';
        document.getElementById('msgContent').value = '';
        msgModal.classList.add('open');
    }

    document.getElementById('closeMsgModal').onclick = () => msgModal.classList.remove('open');
    document.getElementById('cancelMsgBtn').onclick = () => msgModal.classList.remove('open');

    document.getElementById('sendMsgBtn').onclick = async () => {
        const title = document.getElementById('msgSubject').value.trim();
        const message = document.getElementById('msgContent').value.trim();

        if (!title || !message) {
            showCustomToast('Please enter both subject and message.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    message: message,
                    audience: 'Residents',
                    user_id: currentMessageTargetId
                })
            });

            if (response.ok) {
                msgModal.classList.remove('open');
                showCustomToast('Notification sent successfully!', 'success');
            } else {
                showCustomToast('Failed to send notification.', 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showCustomToast('Error sending notification.', 'error');
        }
    };

    // Modal Logic (Remove Resident)
    const remModal = document.getElementById('removeConfirmModal');
    let currentRemoveTargetId = null;

    function openRemoveModal(name, id) {
        const nameEl = document.getElementById('removeTargetName');
        if(nameEl) nameEl.textContent = name;
        currentRemoveTargetId = id;
        if(remModal) remModal.classList.add('open');
    }

    const cancelRemBtn = document.getElementById('cancelRemBtn');
    if(cancelRemBtn) {
        cancelRemBtn.onclick = () => remModal.classList.remove('open');
    }

    const confirmRemBtn = document.getElementById('confirmRemBtn');
    if(confirmRemBtn) {
        confirmRemBtn.onclick = () => {
            remModal.classList.remove('open');
            if (currentRemoveTargetId) {
                deleteResident(currentRemoveTargetId);
            }
        };
    }
});

function showCustomToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isError = type === 'error';
    const mainColor = isError ? '#e74c3c' : '#ff8c00'; // Red for error, Orange for success
    
    toast.style.cssText = `
        background: #1c1c1c;
        border: 1px solid ${mainColor};
        border-left: 4px solid ${mainColor};
        color: #fff;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        min-width: 250px;
        transform: translateX(120%);
        transition: transform 0.3s ease-out;
    `;

    const icon = document.createElement('i');
    icon.className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    icon.style.color = mainColor;
    icon.style.fontSize = '18px';

    const text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
