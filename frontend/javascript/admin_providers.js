document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('providerSearch');
    const providersGrid = document.getElementById('providersGrid');
    const detailOverlay = document.getElementById('providerDetail');
    const closeDetail = document.getElementById('closeDetail');
    const messageModal = document.getElementById('messageModal');
    const actionConfirmModal = document.getElementById('actionConfirmModal');

    const API_BASE_URL = 'http://127.0.0.1:5000';

    let providersData = {};

    // Render provider cards from API data
    function renderProviderCards() {
        const providersGrid = document.getElementById('providersGrid');
        if (!providersGrid) return;

        providersGrid.innerHTML = '';

        if (Object.keys(providersData).length === 0) {
            providersGrid.innerHTML = '<p class="no-data" style="text-align:center;width:100%;grid-column:1/-1;color:#888;">No providers found. Add providers through the admin panel or check your database connection.</p>';
            return;
        }

        Object.values(providersData).forEach(provider => {
            const card = createProviderCard(provider);
            providersGrid.appendChild(card);
        });

        // Re-attach event listeners after creating cards
        attachCardEventListeners();
    }

    // Create provider card element
    function createProviderCard(provider) {
        const card = document.createElement('div');
        card.className = 'provider-card';
        card.dataset.providerId = provider.id;

        const statusClass = provider.status === 'PENDING' ? 'pending' : '';
        const actionButtons = provider.status === 'PENDING' ? 
            `<button class="btn-approve"><i class="far fa-check-circle"></i> APPROVE</button>
             <button class="btn-reject"><i class="far fa-times-circle"></i> REJECT</button>` :
            `<button class="btn-suspend">SUSPEND PROVIDER</button>`;

        card.innerHTML = `
            <div class="card-status ${statusClass}">${provider.status}</div>
            <h3 class="provider-name">${provider.name}</h3>
            <p class="provider-category">${provider.category}</p>
            <p class="provider-email">${provider.email}</p>
            <div class="provider-stats">
                <span><b>${provider.rating || '0.0'}</b> rating</span>
                <span><b>${provider.totalJobs || 0}</b> jobs</span>
            </div>
            <div class="card-actions">
                ${actionButtons}
            </div>
        `;

        return card;
    }

    // Initialize event listeners
    function initializeEventListeners() {
        // Close detail overlay
        if (closeDetail) {
            closeDetail.addEventListener('click', closeProviderDetail);
        }

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', filterProviders);
        }

        // Modal controls
        setupModalControls();
    }

    // Attach event listeners to provider cards
    function attachCardEventListeners() {
        // Provider card click events
        document.querySelectorAll('.provider-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't open detail if clicking on action buttons
                if (e.target.closest('.card-actions')) return;
                
                const providerId = card.dataset.providerId;
                openProviderDetail(providerId);
            });
        });

        // Action button events
        attachActionListeners();
    }

    // Open provider detail view
    function openProviderDetail(providerId) {
        const provider = providersData[providerId];
        if (!provider) return;

        // Populate detail overlay with provider data
        document.getElementById('detailStatus').textContent = provider.status;
        document.getElementById('detailStatus').className = provider.status === 'PENDING' ? 'detail-badge pending' : 'detail-badge';
        document.getElementById('detailName').textContent = provider.name;
        document.getElementById('detailCategory').textContent = provider.category;
        document.getElementById('detailEmail').textContent = provider.email;
        
        document.getElementById('detailPhone').textContent = provider.phone;
        document.getElementById('detailJoinedDate').textContent = provider.joinedDate;
        document.getElementById('detailRating').innerHTML = `<i class="fas fa-star" style="color: var(--orange);"></i> ${provider.rating} / 5.0`;
        document.getElementById('detailDescription').textContent = provider.description;
        document.getElementById('detailSkills').textContent = provider.skills;
        document.getElementById('detailAvailability').textContent = provider.availability;

        // Update recent jobs
        const jobHistoryList = document.querySelector('.job-history-list');
        if (jobHistoryList) {
            jobHistoryList.innerHTML = provider.recentJobs.map(job => `
                <div class="job-small-item">
                    <div class="job-small-info">
                        <h5>${job.title}</h5>
                        <p>${job.date}</p>
                    </div>
                    <div class="job-small-status">${job.status}</div>
                </div>
            `).join('');
        }

        // Update footer buttons
        const suspendBtn = document.querySelector('.detail-footer .btn-suspend');
        const messageBtn = document.querySelector('.detail-footer .btn-msg-prov');
        
        if (suspendBtn) {
            suspendBtn.textContent = provider.status === 'APPROVED' ? 'SUSPEND ACCOUNT' : 'APPROVE ACCOUNT';
            suspendBtn.onclick = () => showActionConfirmation(provider.id, provider.status === 'APPROVED' ? 'suspend' : 'approve');
        }
        
        if (messageBtn) {
            messageBtn.onclick = () => openMessageModal(provider.name);
        }

        // Show overlay
        detailOverlay.classList.add('open');
        
        // Add active class to card
        document.querySelectorAll('.provider-card').forEach(card => card.classList.remove('active'));
        document.querySelector(`[data-provider-id="${providerId}"]`).classList.add('active');
    }

    // Close provider detail view
    function closeProviderDetail() {
        detailOverlay.classList.remove('open');
        document.querySelectorAll('.provider-card').forEach(card => card.classList.remove('active'));
    }

    // Filter providers based on search
    function filterProviders() {
        const searchTerm = searchInput.value.toLowerCase();
        const providerCards = document.querySelectorAll('.provider-card');

        providerCards.forEach(card => {
            const name = card.querySelector('.provider-name').textContent.toLowerCase();
            const email = card.querySelector('.provider-email').textContent.toLowerCase();
            const category = card.querySelector('.provider-category').textContent.toLowerCase();

            const matchesSearch = name.includes(searchTerm) || 
                                email.includes(searchTerm) || 
                                category.includes(searchTerm);

            card.style.display = matchesSearch ? 'block' : 'none';
        });
    }

    // Attach action listeners to buttons
    function attachActionListeners() {
        // Suspend buttons
        document.querySelectorAll('.btn-suspend').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.target.closest('.provider-card');
                const providerId = card.dataset.providerId;
                const providerName = card.querySelector('.provider-name').textContent;
                showActionConfirmation(providerId, 'suspend', providerName);
            });
        });

        // Approve buttons
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.target.closest('.provider-card');
                const providerId = card.dataset.providerId;
                const providerName = card.querySelector('.provider-name').textContent;
                showActionConfirmation(providerId, 'approve', providerName);
            });
        });

        // Reject buttons
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.target.closest('.provider-card');
                const providerId = card.dataset.providerId;
                const providerName = card.querySelector('.provider-name').textContent;
                showActionConfirmation(providerId, 'reject', providerName);
            });
        });
    }

    // Setup modal controls
    function setupModalControls() {
        // Message modal controls
        const closeMsgModal = document.getElementById('closeMsgModal');
        const cancelMsgBtn = document.getElementById('cancelMsgBtn');
        const sendMsgBtn = document.getElementById('sendMsgBtn');

        if (closeMsgModal) closeMsgModal.addEventListener('click', () => closeModal(messageModal));
        if (cancelMsgBtn) cancelMsgBtn.addEventListener('click', () => closeModal(messageModal));
        if (sendMsgBtn) sendMsgBtn.addEventListener('click', sendMessage);

        // Action confirmation modal controls
        const cancelActionBtn = document.getElementById('cancelActionBtn');
        const confirmActionBtn = document.getElementById('confirmActionBtn');

        if (cancelActionBtn) cancelActionBtn.addEventListener('click', () => closeModal(actionConfirmModal));
        if (confirmActionBtn) confirmActionBtn.addEventListener('click', executeConfirmedAction);
    }

    // Open message modal
    function openMessageModal(providerName) {
        document.getElementById('msgTargetName').textContent = providerName;
        document.getElementById('msgSubject').value = '';
        document.getElementById('msgContent').value = '';
        openModal(messageModal);
    }

    // Show action confirmation modal
    function showActionConfirmation(providerId, action, providerName) {
        const modal = actionConfirmModal;
        const icon = document.getElementById('actionIcon');
        const title = document.getElementById('actionTitle');
        const targetName = document.getElementById('actionTargetName');
        const confirmBtn = document.getElementById('confirmActionBtn');

        // Set modal content based on action
        if (action === 'suspend') {
            icon.innerHTML = '<i class="fas fa-ban" style="color: #e74c3c;"></i>';
            icon.style.background = 'rgba(231, 76, 60, 0.1)';
            icon.style.border = '1px solid rgba(231, 76, 60, 0.3)';
            title.textContent = 'Suspend Provider';
            confirmBtn.textContent = 'SUSPEND';
            confirmBtn.style.background = '#e74c3c';
            confirmBtn.style.color = '#fff';
        } else if (action === 'approve') {
            icon.innerHTML = '<i class="fas fa-check-circle" style="color: var(--orange);"></i>';
            icon.style.background = 'rgba(255, 140, 0, 0.1)';
            icon.style.border = '1px solid rgba(255, 140, 0, 0.3)';
            title.textContent = 'Approve Provider';
            confirmBtn.textContent = 'APPROVE';
            confirmBtn.style.background = 'var(--orange)';
            confirmBtn.style.color = '#000';
        } else if (action === 'reject') {
            icon.innerHTML = '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>';
            icon.style.background = 'rgba(231, 76, 60, 0.1)';
            icon.style.border = '1px solid rgba(231, 76, 60, 0.3)';
            title.textContent = 'Reject Provider';
            confirmBtn.textContent = 'REJECT';
            confirmBtn.style.background = '#e74c3c';
            confirmBtn.style.color = '#fff';
        }

        targetName.textContent = providerName;
        confirmBtn.dataset.action = action;
        confirmBtn.dataset.providerId = providerId;

        openModal(modal);
    }

    // Execute confirmed action
    async function executeConfirmedAction(e) {
        const action = e.target.dataset.action;
        const providerId = e.target.dataset.providerId;
        
        try {
            const response = await fetch(`${API_BASE_URL}/update-provider-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider_id: providerId,
                    status: action === 'approve' ? 'active' : action
                })
            });

            if (!response.ok) throw new Error('Failed to update status');

            closeModal(actionConfirmModal);
            showNotification(`Provider ${action}d successfully!`, 'success');
            
            setTimeout(() => {
                loadProviders();
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showNotification('Failed to update status', 'error');
        }
    }

    // Send message
    function sendMessage() {
        const subject = document.getElementById('msgSubject').value;
        const content = document.getElementById('msgContent').value;
        
        if (!subject || !content) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Here you would make API call to send message
        console.log('Sending message:', { subject, content });
        
        closeModal(messageModal);
        showNotification('Message sent successfully!', 'success');
    }

    // Modal helper functions
    function openModal(modal) {
        modal.classList.add('open');
    }

    function closeModal(modal) {
        modal.classList.remove('open');
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--orange)' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: ${type === 'success' ? '#000' : '#fff'};
            padding: 15px 20px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 14px;
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Load providers data from API
    async function loadProviders() {
        const providersGrid = document.getElementById('providersGrid');
        if (providersGrid) {
            providersGrid.innerHTML = '<p class="loading-state" style="text-align:center;width:100%;grid-column:1/-1;color:#888;">Loading providers...</p>';
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/providers`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            if (data.providers && Array.isArray(data.providers)) {
                providersData = {};
                data.providers.forEach(provider => {
                    // Extract specific role, e.g., "Electrician" from "Provider: Electrician"
                    let specificRole = provider.role;
                    if (provider.role.includes(':')) {
                        specificRole = provider.role.split(':')[1].trim();
                    } else if (provider.role.toLowerCase().startsWith('provider')) {
                        // If it's just "Provider", try to use skills as the role
                        specificRole = provider.skills || 'Provider';
                    }

                    // Map backend data to frontend format
                    providersData[provider.id] = {
                        id: provider.id,
                        name: provider.name,
                        email: provider.email,
                        phone: provider.phone || 'N/A',
                        status: provider.status.toUpperCase(),
                        category: specificRole.toUpperCase(),
                        joinedDate: provider.created_at ? new Date(provider.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A',
                        rating: provider.rating || '0.0',
                        totalJobs: provider.total_bookings || 0,
                        description: provider.bio || 'Professional service provider.',
                        skills: provider.skills || 'N/A',
                        availability: provider.availability || 'N/A',
                        recentJobs: []
                    };
                });
            }
            renderProviderCards();
        } catch (error) {
            console.error('Error loading providers:', error);
            showNotification('Failed to load providers', 'error');
            providersData = {};
            renderProviderCards();
        }
    }

    // Initialize everything
    async function initializeApp() {
        await loadProviders();
        initializeEventListeners();
    }

    initializeApp();
});
