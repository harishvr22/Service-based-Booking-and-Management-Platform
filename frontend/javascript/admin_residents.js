document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('residentSearch');
    const blockFilter = document.getElementById('blockFilter');
    const residentsGrid = document.getElementById('residentsGrid');

    
    const API_BASE_URL = 'http://127.0.0.1:5000';

    async function fetchResidents() {
        // Show loading state
        if (residentsGrid) {
            residentsGrid.innerHTML = '<p class="loading-state" style="text-align:center;width:100%;grid-column:1/-1;color:#888;">Loading residents...</p>';
        }

        try {
            const response = await fetch(`${API_BASE_URL}/residents`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            renderResidents(data.residents);
            updateStats(data.residents);
        } catch (error) {
            console.error('Error fetching residents:', error);
            
            // Don't show error notification for development, just log it
            if (error.message.includes('Failed to fetch')) {
                console.log('API endpoint not available yet - showing empty state');
            } else {
                residentsGrid.innerHTML = '<p class="error-msg" style="text-align:center;width:100%;grid-column:1/-1;">Failed to load residents. Please try again later.</p>';
            }
            
            renderResidents([]); // Show empty state
        }
    }

    function renderResidents(residents) {
        residentsGrid.innerHTML = '';

        if (!residents || residents.length === 0) {
            residentsGrid.innerHTML = '<p class="no-data" style="text-align:center;width:100%;grid-column:1/-1;">No residents found. Add residents through the admin panel or check your database connection.</p>';
            return;
        }

        residents.forEach(resident => {
            const card = createResidentCard(resident);
            residentsGrid.appendChild(card);
        });

        attachActionListeners();
        filterResidents();
    }

    // Create resident card element
    function createResidentCard(resident) {
        const card = document.createElement('div');
        card.className = 'resident-card';
        card.dataset.id = resident.id;

        const isActive = resident.role === 'Resident';
        const statusText = isActive ? 'ACTIVE' : 'SUSPENDED';
        const statusClass = isActive ? '' : 'inactive';
        const avatarClass = isActive ? 'res-avatar' : 'res-avatar inactive-av';

        const initials = resident.name ? resident.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA';
        const apartment = resident.apartment_id || 'N/A';
        const block = apartment !== 'N/A' ? apartment.split('-')[0] + ' Block' : 'N/A';
        const moveInDate = resident.move_in_date || 'N/A';
        const bookingCount = resident.booking_count || 0;

        card.innerHTML = `
            <div class="card-status ${statusClass}">${statusText}</div>
            <div class="res-avatar-row">
                <div class="${avatarClass}">${initials}</div>
                <div>
                    <div class="res-name">${resident.name || 'N/A'}</div>
                    <div class="res-flat">Flat ${apartment} &middot; ${block}</div>
                </div>
            </div>
            <p class="res-email"><i class="far fa-envelope"></i> ${resident.email || 'N/A'}</p>
            <p class="res-phone"><i class="fas fa-phone-alt"></i> ${resident.phone || 'N/A'}</p>
            <div class="res-stats">
                <span>Moved in: <b>${moveInDate}</b></span>
                <span><b>${bookingCount}</b> bookings</span>
            </div>
            <div class="card-actions">
                <button class="btn-msg" onclick="event.stopPropagation(); openMessageModal('${resident.name}', '${resident.id}')"><i class="far fa-envelope"></i> MESSAGE</button>
                <button class="btn-rem" onclick="event.stopPropagation(); confirmRemoveResident('${resident.name}', '${resident.id}')">REMOVE</button>
            </div>
        `;

        return card;
    }

    function attachActionListeners() {
        document.querySelectorAll('.btn-suspend').forEach(btn => {
            btn.addEventListener('click', (e) => updateResidentStatus(e.currentTarget.dataset.id, 'suspended', e.currentTarget.closest('.resident-card').querySelector('.name').textContent));
        });

        document.querySelectorAll('.btn-activate').forEach(btn => {
            btn.addEventListener('click', (e) => updateResidentStatus(e.currentTarget.dataset.id, 'active', e.currentTarget.closest('.resident-card').querySelector('.name').textContent));
        });
    }

    async function updateResidentStatus(residentId, status, residentName) {
        if (!confirm(`Are you sure you want to mark ${residentName} as ${status}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/update-resident-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resident_id: residentId,
                    status: status
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'updated') {
                fetchResidents(); 
            } else {
                showNotification(`Error: ${data.message}`, 'error');
            }
        } catch (error) {
            console.error(`Error updating resident to ${status}:`, error);
            showNotification('Failed to update resident status.', 'error');
        }
    }

    function updateStats(residents) {
        let total = residents.length;
        let active = 0;
        let suspended = 0;

        residents.forEach(r => {
            if (r.role === 'Resident') active++;
            else if (r.role === 'Resident_Suspended') suspended++;
        });

        const statBodies = document.querySelectorAll('.stat-body h3');
        if (statBodies && statBodies.length >= 3) {
            statBodies[0].textContent = total;
            statBodies[1].textContent = active;
            statBodies[2].textContent = suspended;
        }
    }

    const filterResidents = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedBlock = blockFilter.value.toLowerCase();
        const residentCards = document.querySelectorAll('.resident-card');

        residentCards.forEach(card => {
            const name = card.querySelector('.name').textContent.toLowerCase();
            const email = card.querySelector('.email').textContent.toLowerCase();
            const phone = card.querySelector('.phone').textContent.toLowerCase();
            const flatInfo = card.querySelector('.label').textContent.toLowerCase();
            let block = card.dataset.block || '';
            block = block.toLowerCase();

            const matchesSearch = name.includes(searchTerm) ||
                email.includes(searchTerm) ||
                phone.includes(searchTerm) ||
                flatInfo.includes(searchTerm);

            const matchesBlock = selectedBlock === 'all' || block.includes(selectedBlock) || flatInfo.includes(selectedBlock);

            if (matchesSearch && matchesBlock) {
                card.style.display = 'block'; // Or flex, depend on original layout. Assuming block as per previous admin_residents.js.
            } else {
                card.style.display = 'none';
            }
        });
    };

    // Modal functions
    function openMessageModal(residentName, residentId) {
        const modal = document.getElementById('messageModal');
        const targetName = document.getElementById('msgTargetName');
        
        if (targetName) targetName.textContent = residentName;
        
        // Clear form
        document.getElementById('msgSubject').value = '';
        document.getElementById('msgContent').value = '';
        
        // Show modal
        modal.style.display = 'flex';
    }

    function confirmRemoveResident(residentName, residentId) {
        const modal = document.getElementById('removeConfirmModal');
        const targetName = document.getElementById('removeTargetName');
        
        if (targetName) targetName.textContent = residentName;
        
        // Show modal
        modal.style.display = 'flex';
    }

    // Close modal functions
    function closeMessageModal() {
        document.getElementById('messageModal').style.display = 'none';
    }

    function closeRemoveModal() {
        document.getElementById('removeConfirmModal').style.display = 'none';
    }

    // Add event listeners for modal close buttons
    const closeMsgBtn = document.getElementById('closeMsgModal');
    const cancelMsgBtn = document.getElementById('cancelMsgBtn');
    const closeRemBtn = document.getElementById('cancelRemBtn');
    
    if (closeMsgBtn) closeMsgBtn.addEventListener('click', closeMessageModal);
    if (cancelMsgBtn) cancelMsgBtn.addEventListener('click', closeMessageModal);
    if (closeRemBtn) closeRemBtn.addEventListener('click', closeRemoveModal);

    if(searchInput) {
        searchInput.addEventListener('input', filterResidents);
    }
    if(blockFilter) {
        blockFilter.addEventListener('change', filterResidents);
    }

    fetchResidents();
});
