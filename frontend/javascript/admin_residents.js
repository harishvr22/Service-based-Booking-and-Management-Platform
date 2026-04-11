document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('residentSearch');
    const blockFilter = document.getElementById('blockFilter');
    const residentsGrid = document.getElementById('residentsGrid');

    const existingCards = document.querySelectorAll('.resident-card');
    let templateCard = null;
    if (existingCards.length > 0) {
        templateCard = existingCards[0].cloneNode(true);
    }

    const API_BASE_URL = 'http://127.0.0.1:5000';

    async function fetchResidents() {
        if (!templateCard) return;

        try {
            const response = await fetch(`${API_BASE_URL}/residents`);
            const data = await response.json();
            renderResidents(data.residents);
            updateStats(data.residents);
        } catch (error) {
            console.error('Error fetching residents:', error);
            residentsGrid.innerHTML = '<p class="error-msg" style="text-align:center;width:100%;grid-column:1/-1;">Failed to load residents. Please try again later.</p>';
        }
    }

    function renderResidents(residents) {
        residentsGrid.innerHTML = '';

        if (!residents || residents.length === 0) {
            residentsGrid.innerHTML = '<p class="no-data" style="text-align:center;width:100%;grid-column:1/-1;">No residents found.</p>';
            return;
        }

        residents.forEach(resident => {
            const card = templateCard.cloneNode(true);

            // Populate DB info
            const nameEl = card.querySelector('.name');
            if (nameEl) nameEl.textContent = resident.name;

            const emailEl = card.querySelector('.email');
            if (emailEl) emailEl.innerHTML = `<i class="fas fa-envelope"></i> ${resident.email}`;

            const phoneEl = card.querySelector('.phone');
            if (phoneEl) phoneEl.innerHTML = `<i class="fas fa-phone-alt"></i> ${resident.phone || 'N/A'}`;

            // E.g. "Flat A-101"
            const labelEl = card.querySelector('.label');
            if (labelEl) labelEl.textContent = `Flat ${resident.apartment_id || 'N/A'}`;
            card.dataset.block = resident.apartment_id ? resident.apartment_id.split('-')[0].toLowerCase() : 'all';

            const badge = card.querySelector('.badge');
            let statusText = 'Active';
            let badgeClass = 'badge-active';
            
            // Reusables
            let btnContainer = card.querySelector('.btn-suspend')?.parentElement;
            if (!btnContainer) {
                btnContainer = card.querySelector('.btn-activate')?.parentElement;
            }
            if(!btnContainer) {
                // If the generic button container isn't found, try to find the action div
                btnContainer = card.querySelector('.card-actions') || card.querySelector('.actions'); 
            }
            
            if (btnContainer) {
                if (resident.role === 'Resident') {
                    statusText = 'Active';
                    badgeClass = 'badge-active';
                    btnContainer.innerHTML = `
                        <button class="btn-suspend" data-id="${resident.id}">
                            <i class="fas fa-ban"></i> Suspend
                        </button>
                    `;
                } else if (resident.role === 'Resident_Suspended') {
                    statusText = 'Suspended';
                    badgeClass = 'badge-inactive';
                    btnContainer.innerHTML = `
                        <button class="btn-activate" data-id="${resident.id}">
                            <i class="fas fa-check-circle"></i> Activate
                        </button>
                    `;
                }
            }

            if(badge) {
                badge.className = `badge ${badgeClass}`;
                badge.textContent = statusText;
            }

            residentsGrid.appendChild(card);
        });

        attachActionListeners();
        filterResidents();
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
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error(`Error updating resident to ${status}:`, error);
            alert('Failed to update resident status.');
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

    if(searchInput) {
        searchInput.addEventListener('input', filterResidents);
    }
    if(blockFilter) {
        blockFilter.addEventListener('change', filterResidents);
    }

    fetchResidents();
});
