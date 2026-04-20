document.addEventListener('DOMContentLoaded', () => {
    // Socket.IO connection
    const socket = io('http://localhost:5000');

    socket.on('new_notification', function(data) {
        console.log('New notification received:', data);
        // Check if relevant to this user
        const isProvider = document.title.includes('Provider');
        const allowedAudiences = isProvider 
            ? ['All Users', 'Service Providers'] 
            : ['All Users', 'Residents Only'];
        
        if (allowedAudiences.includes(data.audience)) {
            // Add to localStorage
            const newNotif = {
                id: Date.now().toString(),
                title: data.title,
                message: data.message,
                audience: data.audience,
                date: new Date().toISOString(),
                read: false,
                iconClass: 'far fa-bell'
            };
            let allNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
            allNotifs.unshift(newNotif);
            localStorage.setItem('admin_notifications', JSON.stringify(allNotifs));
            
            // Refresh the notifications
            loadNotifications();
        }
    });
    const notifList = document.querySelector('.notification-list');
    const badge = document.querySelector('.sidebar-nav .badge') || document.querySelector('.nav-icon-btn .badge');
    const markAllBtn = document.querySelector('.mark-read-btn');
    
    // Determine the audience based on the page context (simple heuristic)
    // If we're on Provider Dashboard/Nav, we only want "All Users" or "Service Providers"
    // If Resident, "All Users" or "Residents Only"
    const isProvider = document.title.includes('Provider');
    const allowedAudiences = isProvider 
        ? ['All Users', 'Service Providers'] 
        : ['All Users', 'Residents Only'];

    function loadNotifications() {
        const adminNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        
        let unreadCount = 0;
        
        // Filter notifs by audience
        const relevantNotifs = adminNotifs.filter(n => allowedAudiences.includes(n.audience));
        
        relevantNotifs.forEach(notif => {
            if (!notif.read) unreadCount++;
            
            // Create DOM element
            const item = document.createElement('div');
            item.className = `notification-item ${notif.read ? '' : 'unread'}`;
            // Use orange-bg for unread, gray-bg for read
            const bgClass = notif.read ? 'gray-bg' : 'orange-bg';
            
            // Format time elapsed
            let timeStr = 'Just now';
            if(notif.date) {
                const diffMs = Date.now() - new Date(notif.date).getTime();
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
                ${!notif.read ? '<span class="unread-dot"></span>' : ''}
              </div>
            `;
            
            if(notifList) {
                notifList.insertBefore(item, notifList.firstChild);
            }
        });

        // Update badges
        const allBadges = document.querySelectorAll('.badge:not(.badge-purple):not(.badge-green):not(.badge-blue)');
        allBadges.forEach(b => {
             if (unreadCount > 0) {
                 // Mock badging added on top of existing mock unread 
                 b.textContent = unreadCount + 2; 
                 b.style.display = 'inline-block';
             }
        });
    }

    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            const adminNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
            adminNotifs.forEach(n => {
                if(allowedAudiences.includes(n.audience)) {
                    n.read = true;
                }
            });
            localStorage.setItem('admin_notifications', JSON.stringify(adminNotifs));
            
            // Visual update
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
            
            // clear badge
            const allBadges = document.querySelectorAll('.badge:not(.badge-purple):not(.badge-green):not(.badge-blue)');
            allBadges.forEach(b => { b.textContent = '0'; b.style.display = 'none'; });
        });
    }

    loadNotifications();
});
