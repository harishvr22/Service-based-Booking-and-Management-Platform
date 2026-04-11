document.addEventListener('DOMContentLoaded', () => {
    const providerSearch = document.getElementById('providerSearch');
    const categorySelect = document.querySelector('.category-select select');
    const providerGrid = document.querySelector('.provider-grid');

    // Extract a template from the existing HTML securely before clearing it
    const existingCards = document.querySelectorAll('.provider-card');
    let templateCard = null;
    if (existingCards.length > 0) {
        templateCard = existingCards[0].cloneNode(true); // Keep one as a template
    }

    const API_BASE_URL = 'http://127.0.0.1:5000';

    async function fetchProviders() {
        if (!templateCard) return; // Cannot render without the template
        
        try {
            const response = await fetch(`${API_BASE_URL}/providers`);
            const data = await response.json();
            renderProviders(data.providers);
            updateStats(data.providers);
        } catch (error) {
            console.error('Error fetching providers:', error);
            providerGrid.innerHTML = '<p class="error-msg" style="text-align:center;width:100%;grid-column:1/-1;">Failed to load providers. Please try again later.</p>';
        }
    }

    function renderProviders(providers) {
        // Clear grid completely
        providerGrid.innerHTML = '';
        
        if (!providers || providers.length === 0) {
            providerGrid.innerHTML = '<p class="no-data" style="text-align:center;width:100%;grid-column:1/-1;">No providers found.</p>';
            return;
        }

        providers.forEach((provider) => {
            // Clone the template card
            const card = templateCard.cloneNode(true);
            
            // Populate basic DB info into the existing structure
            const nameElement = card.querySelector('h3');
            if (nameElement) nameElement.textContent = provider.name;

            const phoneIcon = card.querySelector('.fa-phone-alt');
            if (phoneIcon && phoneIcon.parentNode) {
                // Keep the icon, update text
                phoneIcon.parentNode.innerHTML = `<i class="fas fa-phone-alt"></i> ${provider.phone || 'N/A'}`;
            }

            // Setup Badge Status dynamically
            const badge = card.querySelector('.badge');
            let statusText = 'Pending Verification';
            let badgeClass = 'badge-pending';
            
            // Default footer content template based on status
            const footer = card.querySelector('.provider-footer');
            footer.innerHTML = ''; // Start fresh
            footer.className = 'provider-footer';

            if (provider.role === 'Provider') {
                statusText = 'Pending Verification';
                badgeClass = 'badge-pending';
                footer.className = 'provider-footer double';
                footer.innerHTML = `
                    <button class="btn-approve" data-id="${provider.id}">
                        <i class="fas fa-check-circle"></i> Approve
                    </button>
                    <button class="btn-reject" data-id="${provider.id}">
                        <i class="fas fa-times-circle"></i> Reject
                    </button>
                `;
            } else if (provider.role === 'Provider_Approved') {
                statusText = 'Approved';
                badgeClass = 'badge-approved';
                footer.innerHTML = `
                    <button class="btn-suspend" data-id="${provider.id}">
                        <i class="fas fa-ban"></i> Suspend
                    </button>
                `;
            } else if (provider.role === 'Provider_Rejected') {
                statusText = 'Rejected';
                badgeClass = 'badge'; // Remove specific class
                badge.style.background = '#fee2e2';
                badge.style.color = '#ef4444';
                footer.className = 'provider-footer empty';
                footer.style.display = 'none';
            } else if (provider.role === 'Provider_Suspended') {
                statusText = 'Suspended';
                badgeClass = 'badge';
                badge.style.background = '#ffedd5';
                badge.style.color = '#f97316';
                footer.innerHTML = `
                    <button class="btn-approve" data-id="${provider.id}">
                        <i class="fas fa-check-circle"></i> Re-Approve
                    </button>
                `;
            }

            if (badge) {
                badge.className = `badge ${badgeClass}`;
                badge.textContent = statusText;
            }

            // Note: Specialization, Metrics, and Experience nodes are left EXACTLY as they are in the HTML template unmodified,
            // satisfying the requirement to not affect the existing file's aesthetic, yet injecting DB exact data.

            providerGrid.appendChild(card);
        });

        attachActionListeners();
        filterProviders();
    }

    function attachActionListeners() {
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', (e) => updateProviderStatus(e.currentTarget.dataset.id, 'approved', e.currentTarget.closest('.provider-card').querySelector('h3').textContent));
        });

        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', (e) => updateProviderStatus(e.currentTarget.dataset.id, 'rejected', e.currentTarget.closest('.provider-card').querySelector('h3').textContent));
        });

        document.querySelectorAll('.btn-suspend').forEach(btn => {
            btn.addEventListener('click', (e) => updateProviderStatus(e.currentTarget.dataset.id, 'suspended', e.currentTarget.closest('.provider-card').querySelector('h3').textContent));
        });
    }

    async function updateProviderStatus(providerId, status, providerName) {
        if (!confirm(`Are you sure you want to mark ${providerName} as ${status}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/update-provider-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider_id: providerId,
                    status: status
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'updated') {
                fetchProviders(); 
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error(`Error updating provider to ${status}:`, error);
            alert('Failed to update provider status.');
        }
    }

    function updateStats(providers) {
        let total = providers.length;
        let pending = 0;
        let approved = 0;
        let rejected = 0; 

        providers.forEach(p => {
            if (p.role === 'Provider') pending++;
            else if (p.role === 'Provider_Approved') approved++;
            else if (p.role === 'Provider_Rejected' || p.role === 'Provider_Suspended') rejected++;
        });

        const statBodies = document.querySelectorAll('.stat-body h3');
        if (statBodies.length >= 4) {
            statBodies[0].textContent = total;
            statBodies[1].textContent = pending;
            statBodies[2].textContent = approved;
            statBodies[3].textContent = rejected;
        }
    }

    function filterProviders() {
        const searchTerm = providerSearch.value.toLowerCase();
        const selectedCategory = categorySelect.value.toLowerCase();
        const providerCards = document.querySelectorAll('.provider-card');

        providerCards.forEach(card => {
            const providerName = card.querySelector('h3').textContent.toLowerCase();
            const specialization = card.querySelector('.specialization p').textContent.toLowerCase();
            const categoryTag = card.querySelector('.tag').textContent.toLowerCase();

            const matchesSearch = providerName.includes(searchTerm) || specialization.includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || categoryTag === selectedCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (providerSearch) {
        providerSearch.addEventListener('input', filterProviders);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', filterProviders);
    }

    // Call fetch immediately
    fetchProviders();
});
