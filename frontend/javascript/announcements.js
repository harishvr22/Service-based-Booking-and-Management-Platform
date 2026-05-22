document.addEventListener('DOMContentLoaded', () => {
    console.log('Announcements JS Initialized');

    const API_BASE = window.API_BASE_URL || 'http://localhost:5000';
    const audienceButtons = document.querySelectorAll('.audience-btn');
    const publishBtn = document.getElementById('publishBtn');
    const announcementList = document.getElementById('announcementList');
    
    let selectedAudience = 'All';
    let announcementToDelete = null;

    // Modal elements
    const deleteModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    // Initial load
    fetchAnnouncements();

    // Audience selection logic
    audienceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            audienceButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAudience = btn.getAttribute('data-audience');
            console.log('Selected audience:', selectedAudience);
        });
    });

    // Publish announcement
    if (publishBtn) {
        publishBtn.addEventListener('click', () => {
            const titleInput = document.getElementById('announcementTitle');
            const messageInput = document.getElementById('announcementMessage');
            
            const title = titleInput.value.trim();
            const message = messageInput.value.trim();

            if (!title || !message) {
                showToast('Please fill in all fields.', 'error');
                return;
            }

            handlePublish(title, message, selectedAudience);
            
            // Clear inputs
            titleInput.value = '';
            messageInput.value = '';
        });
    }

    /**
     * Fetch announcements from backend
     */
    async function fetchAnnouncements() {
        try {
            const response = await fetch(`${API_BASE}/notifications`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            
            announcementList.innerHTML = '';
            if (data.length === 0) {
                announcementList.innerHTML = '<div class="no-announcements">No announcements found.</div>';
                return;
            }

            data.forEach(notif => {
                const date = new Date(notif.created_at);
                const dateString = date.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
                addAnnouncementToUI(notif, dateString);
            });
        } catch (error) {
            console.error('Error fetching announcements:', error);
            showToast('Failed to load announcements from server.', 'error');
            // Fallback to localStorage for demo/offline
            loadFromLocalStorage();
        }
    }

    function loadFromLocalStorage() {
        const adminNotifs = JSON.parse(localStorage.getItem('admin_sent_announcements') || '[]');
        announcementList.innerHTML = '';
        adminNotifs.forEach(notif => {
            const date = new Date(notif.date || notif.created_at);
            const dateString = date.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });
            addAnnouncementToUI(notif, dateString);
        });
    }

    /**
     * Handle the publishing of a new announcement
     */
    async function handlePublish(title, message, audience) {
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PUBLISHING...';
        publishBtn.disabled = true;

        const adminId = localStorage.getItem('userId') || '1';
        const adminName = localStorage.getItem('userName') || 'Admin';

        const payload = {
            title: title,
            message: message,
            audience: audience,
            created_by: parseInt(adminId) || 1  // Send integer ID
        };

        try {
            const response = await fetch(`${API_BASE}/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Publish failed');

            showToast(`Announcement broadcasted to ${audience.toUpperCase()} successfully!`, 'success');
            fetchAnnouncements(); // Refresh list

        } catch (error) {
            console.error('Error publishing:', error);
            showToast('Failed to publish announcement to server.', 'error');
            
            // Fallback: save to localStorage if backend fails
            const newNotif = {
                id: Date.now(),
                ...payload,
                created_at: new Date().toISOString()
            };
            saveToLocalStorage(newNotif);
            addAnnouncementToUI(newNotif, new Date().toLocaleDateString());
        } finally {
            publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> PUBLISH ANNOUNCEMENT';
            publishBtn.disabled = false;
        }
    }

    function saveToLocalStorage(notif) {
        let adminNotifs = JSON.parse(localStorage.getItem('admin_sent_announcements') || '[]');
        adminNotifs.unshift(notif);
        localStorage.setItem('admin_sent_announcements', JSON.stringify(adminNotifs));
    }

    /**
     * Add the announcement to the UI list
     */
    function addAnnouncementToUI(notif, dateString) {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        item.setAttribute('data-id', notif.id);
        
        const audClass = getAudienceClass(notif.audience);
        const audLabel = getAudienceLabel(notif.audience);

        item.innerHTML = `
            <button class="item-delete" onclick="deleteAnnouncement(this, ${notif.id})"><i class="fas fa-trash"></i></button>
            <div class="item-header">
                <span class="item-audience ${audClass}">${audLabel}</span>
                <span class="item-date">${dateString}</span>
            </div>
            <h4 class="item-title">${notif.title}</h4>
            <p class="item-body">${notif.message}</p>
        `;

        announcementList.appendChild(item);
    }

    function getAudienceClass(audience) {
        switch(audience) {
            case 'Residents': return 'aud-residents';
            case 'Providers': return 'aud-providers';
            default: return 'aud-all';
        }
    }

    function getAudienceLabel(audience) {
        switch(audience) {
            case 'Residents': return 'RESIDENTS ONLY';
            case 'Providers': return 'PROVIDERS ONLY';
            default: return 'ALL USERS';
        }
    }

    // Global delete function
    window.deleteAnnouncement = function(btn, id) {
        announcementToDelete = { btn, id };
        deleteModal.classList.add('open');
    };

    // Modal event listeners
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            deleteModal.classList.remove('open');
            announcementToDelete = null;
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (!announcementToDelete) return;
            
            const { btn, id } = announcementToDelete;
            const item = btn.closest('.announcement-item');
            
            confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> DELETING...';
            confirmDeleteBtn.disabled = true;

            try {
                const response = await fetch(`${API_BASE}/notifications/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(-20px)';
                    item.style.transition = 'all 0.3s ease';
                    setTimeout(() => {
                        item.remove();
                        showToast('Announcement removed from server.', 'info');
                    }, 300);
                } else {
                    throw new Error('Delete failed');
                }
            } catch (error) {
                console.error('Delete error:', error);
                item.remove();
                removeFromLocalStorage(id);
                showToast('Announcement removed locally.', 'info');
            } finally {
                deleteModal.classList.remove('open');
                confirmDeleteBtn.innerHTML = 'YES, DELETE';
                confirmDeleteBtn.disabled = false;
                announcementToDelete = null;
            }
        });
    }

    function removeFromLocalStorage(id) {
        let adminNotifs = JSON.parse(localStorage.getItem('admin_sent_announcements') || '[]');
        adminNotifs = adminNotifs.filter(n => n.id != id);
        localStorage.setItem('admin_sent_announcements', JSON.stringify(adminNotifs));
    }

    /**
     * Toast notification system
     */
    function showToast(message, type = 'info') {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            info: '#3498db'
        };

        toast.style.cssText = `
            background: ${colors[type] || colors.info};
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out forwards;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-times-circle' : 'fa-info-circle');
        toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Add styles for toast animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .no-announcements {
            color: rgba(255,255,255,0.5);
            text-align: center;
            padding: 40px;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
});
