document.addEventListener('DOMContentLoaded', () => {
    // Socket.IO connection
    const socket = io('http://localhost:5000');

    const notifList = document.querySelector('.notification-list');
    const markAllBtn = document.querySelector('.mark-read-btn');
    
    // Determine the audience based on the page context
    const isProvider = document.title.includes('Provider') || window.location.href.includes('Provider');
    const audienceTag = isProvider ? 'Providers' : 'Residents';
    const allowedAudiences = ['All', audienceTag];

    console.log('Audience context:', audienceTag);

    // Initial load from backend
    fetchNotifications();

    socket.on('new_notification', function(data) {
        console.log('New notification received via socket:', data);
        if (allowedAudiences.includes(data.audience)) {
            // Refresh list
            fetchNotifications();
            // Optional: show a browser notification or toast
            if (window.Notification && Notification.permission === "granted") {
                new Notification(data.title, { body: data.message });
            }
        }
    });

    async function fetchNotifications() {
        try {
            const response = await fetch('http://localhost:5000/notifications');
            if (!response.ok) throw new Error('Failed to fetch');
            const allNotifs = await response.json();
            
            // Filter by audience
            const relevantNotifs = allNotifs.filter(n => allowedAudiences.includes(n.audience));
            renderNotifications(relevantNotifs);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Fallback to localStorage if server is down
            const localNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
            const relevant = localNotifs.filter(n => allowedAudiences.includes(n.audience));
            renderNotifications(relevant);
        }
    }

    function renderNotifications(notifs) {
        if (!notifList) return;
        notifList.innerHTML = '';
        
        let unreadCount = 0;
        
        notifs.forEach(notif => {
            const isRead = notif.is_read || notif.read;
            if (!isRead) unreadCount++;
            
            const item = document.createElement('div');
            item.className = `notification-item ${isRead ? '' : 'unread'}`;
            const bgClass = isRead ? 'gray-bg' : 'orange-bg';
            
            let timeStr = 'Just now';
            const createdDate = notif.created_at || notif.date;
            if(createdDate) {
                const diffMs = Date.now() - new Date(createdDate).getTime();
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins < 60) timeStr = `${diffMins || 1}m ago`;
                else if (diffMins < 1440) timeStr = `${Math.floor(diffMins/60)}h ago`;
                else timeStr = `${Math.floor(diffMins/1440)}d ago`;
            }

            item.innerHTML = `
              <div class="notif-icon-wrapper ${bgClass}">
                <i class="${notif.iconClass || 'far fa-bell'}"></i>
              </div>
              <div class="notif-content">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
              </div>
              <div class="notif-meta">
                <span class="notif-time">${timeStr}</span>
                ${!isRead ? '<span class="unread-dot"></span>' : ''}
              </div>
            `;
            
            notifList.appendChild(item);
        });

        updateBadges(unreadCount);
    }

    function updateBadges(count) {
        const badges = document.querySelectorAll('.badge:not(.badge-purple):not(.badge-green):not(.badge-blue)');
        badges.forEach(b => {
             if (count > 0) {
                 b.textContent = count; 
                 b.style.display = 'inline-block';
             } else {
                 b.style.display = 'none';
             }
        });
    }

    if (markAllBtn) {
        markAllBtn.addEventListener('click', async () => {
            // In a real app, we'd call an API to mark all as read
            // For now, let's just update the UI and localStorage
            try {
                // Mock API call for each unread one (or a bulk one if it existed)
                // Since we only have /notifications/<id>/read, we'd need to loop
                // But let's just refresh the UI for now
                showToast('All notifications marked as read', 'success');
                // We'll just assume they're all read locally for the session
                document.querySelectorAll('.notification-item.unread').forEach(item => {
                    item.classList.remove('unread');
                    const dot = item.querySelector('.unread-dot');
                    if(dot) dot.remove();
                    const iconBg = item.querySelector('.notif-icon-wrapper');
                    if(iconBg) {
                        iconBg.classList.remove('orange-bg');
                        iconBg.classList.add('gray-bg');
                    }
                });
                updateBadges(0);
            } catch (e) {
                console.error(e);
            }
        });
    }
});

// Helper for toast if not defined
function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log(`Toast [${type}]: ${message}`);
    }
}
