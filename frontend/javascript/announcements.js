document.addEventListener('DOMContentLoaded', () => {
    console.log('Announcements JS Initialized');

    const audienceButtons = document.querySelectorAll('.audience-btn');
    const publishBtn = document.getElementById('publishBtn');
    const announcementList = document.getElementById('announcementList');
    
    let selectedAudience = 'All';

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
     * Handle the publishing of a new announcement
     */
    function handlePublish(title, message, audience) {
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PUBLISHING...';
        publishBtn.disabled = true;

        // Simulate API delay
        setTimeout(() => {
            const date = new Date();
            const dateString = date.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });

            // Create notification object for storage
            const newNotif = {
                id: Date.now().toString(),
                title: title,
                message: message,
                audience: audience,
                date: new Date().toISOString(),
                read: false,
                iconClass: getAudienceIcon(audience)
            };

            // Save to localStorage for both admin and target audience
            saveNotification(newNotif);

            // Prepend to UI list
            addAnnouncementToUI(newNotif, dateString);

            // Reset button
            publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> PUBLISH ANNOUNCEMENT';
            publishBtn.disabled = false;

            showToast(`Announcement broadcasted to ${audience.toUpperCase()} successfully!`, 'success');
        }, 1200);
    }

    /**
     * Get the correct icon class for the audience
     */
    function getAudienceIcon(audience) {
        switch(audience) {
            case 'Residents': return 'fas fa-home';
            case 'Providers': return 'fas fa-wrench';
            default: return 'fas fa-globe';
        }
    }

    /**
     * Save notification to localStorage
     */
    function saveNotification(notif) {
        // Admin's view of sent notifications
        let adminNotifs = JSON.parse(localStorage.getItem('admin_sent_announcements') || '[]');
        adminNotifs.unshift(notif);
        localStorage.setItem('admin_sent_announcements', JSON.stringify(adminNotifs));

        // Shared notification system (e.g. for header bells)
        let allNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        allNotifs.unshift(notif);
        localStorage.setItem('admin_notifications', JSON.stringify(allNotifs));
    }

    /**
     * Add the announcement to the UI list
     */
    function addAnnouncementToUI(notif, dateString) {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        item.style.animation = 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        
        const audClass = getAudienceClass(notif.audience);
        const audLabel = getAudienceLabel(notif.audience);

        item.innerHTML = `
            <button class="item-delete" onclick="deleteAnnouncement(this)"><i class="fas fa-trash"></i></button>
            <div class="item-header">
                <span class="item-audience ${audClass}">${audLabel}</span>
                <span class="item-date">${dateString}</span>
            </div>
            <h4 class="item-title">${notif.title}</h4>
            <p class="item-body">${notif.message}</p>
        `;

        if (announcementList.firstChild) {
            announcementList.insertBefore(item, announcementList.firstChild);
        } else {
            announcementList.appendChild(item);
        }
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
    window.deleteAnnouncement = function(btn) {
        if (confirm('Are you sure you want to delete this announcement?')) {
            const item = btn.closest('.announcement-item');
            item.style.opacity = '0';
            item.style.transform = 'translateY(-20px)';
            item.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                item.remove();
                showToast('Announcement removed.', 'info');
            }, 300);
        }
    };

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
    `;
    document.head.appendChild(style);
});
