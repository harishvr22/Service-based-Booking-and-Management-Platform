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
                
                <div class="card-actions">
                    <button class="btn-msg"><i class="far fa-envelope"></i> MESSAGE</button>
                    <button class="btn-rem">VIEW DETAILS</button>
                </div>
            `;
            
            card.addEventListener('click', () => openDetailPanel(res.id));
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
        msgBtn.onclick = () => openMessageModal(res.name);
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
    function openMessageModal(name) {
        document.getElementById('msgTargetName').textContent = name;
        msgModal.classList.add('open');
    }
    document.getElementById('closeMsgModal').onclick = () => msgModal.classList.remove('open');
    document.getElementById('cancelMsgBtn').onclick = () => msgModal.classList.remove('open');
});
