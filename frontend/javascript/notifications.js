document.addEventListener('DOMContentLoaded', () => {
    const notifList = document.querySelector('.notification-list');
    const markAllBtn = document.querySelector('.mark-read-btn');

    // Determine the audience based on the page context
    const isProvider = document.title.includes('Provider') || window.location.href.includes('Provider');
    const audienceTag = isProvider ? 'Providers' : 'Residents';
    const allowedAudiences = ['All', audienceTag];

    // Storage key for read-state persistence
    const readKey = `read_notifs_${audienceTag}`;

    // Track which IDs have been marked read this session / locally
    let localReadIds = JSON.parse(localStorage.getItem(readKey) || '[]');

    // Current notification data
    let currentNotifs = [];

    // Show loading state
    if (notifList) {
        notifList.innerHTML = `
            <div class="notification-item" style="justify-content:center; cursor:default;">
                <div class="spinner" style="width:24px;height:24px;border-width:2px;margin-right:12px;"></div>
                <span style="color:var(--text-muted); font-size:14px;">Loading notifications...</span>
            </div>
        `;
    }

    // Try Socket.IO only if available
    try {
        const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'], timeout: 3000 });
        socket.on('new_notification', function (data) {
            const currentUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
            const matchAudience = allowedAudiences.includes(data.audience);
            const matchUser = data.user_id && currentUserId && String(data.user_id) === String(currentUserId);
            
            if (matchAudience || matchUser) {
                fetchNotifications();
            }
        });
        socket.on('connect_error', () => { /* silently ignore socket errors */ });
    } catch (_) { /* Socket.IO not available, ignore */ }

    // Initial load
    fetchNotifications();

    async function fetchNotifications() {
        let notifs = [];
        let source = 'backend';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const response = await fetch('http://localhost:5000/notifications', { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error('Failed to fetch');
            const allNotifs = await response.json();
            const currentUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
            
            notifs = allNotifs.filter(n => {
                // Show if it's for everyone/role
                const matchAudience = allowedAudiences.includes(n.audience);
                
                // Show if it's specifically for this user
                const matchUser = n.user_id && currentUserId && String(n.user_id) === String(currentUserId);
                
                // If a notification has a specific user_id, only show it to THAT user
                if (n.user_id) {
                    return matchUser;
                }
                
                return matchAudience;
            });
            // Save to localStorage for offline fallback
            localStorage.setItem('cached_notifs_' + audienceTag, JSON.stringify(notifs));
        } catch (error) {
            console.warn('Backend fetch failed, using fallback:', error.message || error);
            source = 'fallback';
            // Try cached backend data first
            const cached = JSON.parse(localStorage.getItem('cached_notifs_' + audienceTag) || '[]');
            if (cached.length > 0) {
                notifs = cached.filter(n => allowedAudiences.includes(n.audience));
            }
            // Also merge any admin-created localStorage notifs
            const adminNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
            const localRelevant = adminNotifs.filter(n => allowedAudiences.includes(n.audience));
            if (localRelevant.length > 0) {
                notifs = notifs.length > 0 ? notifs : localRelevant;
            }
        }

        currentNotifs = notifs;
        renderNotifications(notifs, source);
    }

    function renderNotifications(notifs, source) {
        if (!notifList) return;
        notifList.innerHTML = '';

        if (!notifs || notifs.length === 0) {
            notifList.innerHTML = `
                <div class="notification-item" style="justify-content:center; flex-direction:column; gap:12px; cursor:default; padding: 40px 0;">
                    <p style="color:var(--text-muted); font-size:16px; font-weight: 500;">No notifications yet.</p>
                </div>
            `;
            updateBadges(0);
            return;
        }

        let unreadCount = 0;

        notifs.forEach(notif => {
            const id = notif.id || notif._id || notif.notification_id;
            // Mark read if backend says read OR if user clicked it locally
            const backendRead = notif.is_read || notif.read;
            const locallyRead = id && localReadIds.includes(id);
            const isRead = backendRead || locallyRead;
            if (!isRead) unreadCount++;

            const item = document.createElement('div');
            item.className = `notification-item ${isRead ? '' : 'unread'}`;
            item.style.cursor = isRead ? 'default' : 'pointer';
            const bgClass = isRead ? 'gray-bg' : 'orange-bg';

            let timeStr = 'Just now';
            const createdDate = notif.created_at || notif.date || notif.timestamp;
            if (createdDate) {
                const diffMs = Date.now() - new Date(createdDate).getTime();
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins < 1) timeStr = 'Just now';
                else if (diffMins < 60) timeStr = `${diffMins}m ago`;
                else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)}h ago`;
                else timeStr = `${Math.floor(diffMins / 1440)}d ago`;
            }

            item.innerHTML = `
                <div class="notif-icon-wrapper ${bgClass}">
                    <i class="${notif.iconClass || 'far fa-bell'}"></i>
                </div>
                <div class="notif-content">
                    <h4>${notif.title || 'Notification'}</h4>
                    <p>${notif.message || ''}</p>
                </div>
                <div class="notif-meta">
                    <span class="notif-time">${timeStr}</span>
                    ${!isRead ? '<span class="unread-dot"></span>' : ''}
                </div>
            `;

            // Click to mark as read
            if (!isRead) {
                item.addEventListener('click', () => markOneRead(item, id, notif));
            }

            notifList.appendChild(item);
        });

        updateBadges(unreadCount);
    }

    function markOneRead(itemEl, id, notif) {
        // Visual update immediately
        itemEl.classList.remove('unread');
        itemEl.style.cursor = 'default';
        const dot = itemEl.querySelector('.unread-dot');
        if (dot) dot.remove();
        const iconBg = itemEl.querySelector('.notif-icon-wrapper');
        if (iconBg) {
            iconBg.classList.remove('orange-bg');
            iconBg.classList.add('gray-bg');
        }

        // Persist locally
        if (id && !localReadIds.includes(id)) {
            localReadIds.push(id);
            localStorage.setItem(readKey, JSON.stringify(localReadIds));
        }

        // Try backend call (fire-and-forget)
        if (id) {
            fetch(`http://localhost:5000/notifications/${id}/read`, { method: 'POST' })
                .catch(() => { /* Backend may not have this endpoint; local state already updated */ });
        }

        // Recalculate count and update all badges
        recalcAndUpdateBadges();
    }

    function recalcAndUpdateBadges() {
        let unreadCount = 0;
        currentNotifs.forEach(notif => {
            const id = notif.id || notif._id || notif.notification_id;
            const backendRead = notif.is_read || notif.read;
            const locallyRead = id && localReadIds.includes(id);
            if (!backendRead && !locallyRead) unreadCount++;
        });
        updateBadges(unreadCount);
    }

    function updateBadges(count) {
        // Update notification count in localStorage for cross-page sync
        localStorage.setItem('unread_notif_count_' + audienceTag, String(count));

        // Update all bell badges on this page
        const badges = document.querySelectorAll('.badge');
        badges.forEach(b => {
            if (count > 0) {
                b.textContent = count;
                b.style.display = 'inline-block';
            } else {
                b.style.display = 'none';
            }
        });
    }

    // Clear All button
    const clearAllBtn = document.querySelector('.clear-notif-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            showConfirmDialog(
                'Clear All Notifications',
                'Are you sure you want to delete all notifications? This action cannot be undone.',
                () => {
                    // Try to delete from backend
                    const deletePromises = currentNotifs.map(notif => {
                        const id = notif.id || notif._id || notif.notification_id;
                        if (id) {
                            return fetch(`http://localhost:5000/notifications/${id}`, { method: 'DELETE' }).catch(() => { });
                        }
                        return Promise.resolve();
                    });

                    Promise.all(deletePromises).then(() => {
                        // Clear UI
                        currentNotifs = [];
                        renderNotifications([], 'backend');
                        localReadIds = [];
                        localStorage.setItem(readKey, JSON.stringify([]));
                        showToast('All notifications cleared', 'success');
                    });
                }
            );
        });
    }

    // Mark All as Read button
    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
                item.style.cursor = 'default';
                const dot = item.querySelector('.unread-dot');
                if (dot) dot.remove();
                const iconBg = item.querySelector('.notif-icon-wrapper');
                if (iconBg) {
                    iconBg.classList.remove('orange-bg');
                    iconBg.classList.add('gray-bg');
                }
            });

            // Mark all current IDs as read
            currentNotifs.forEach(notif => {
                const id = notif.id || notif._id || notif.notification_id;
                if (id && !localReadIds.includes(id)) localReadIds.push(id);
            });
            localStorage.setItem(readKey, JSON.stringify(localReadIds));

            updateBadges(0);
            showToast('All notifications marked as read', 'success');
        });
    }
});

// Cross-page badge sync: update bell badge on every page load
(function syncBadgeOnLoad() {
    const isProvider = document.title.includes('Provider') || window.location.href.includes('Provider');
    const audienceTag = isProvider ? 'Providers' : 'Residents';
    const countStr = localStorage.getItem('unread_notif_count_' + audienceTag);
    const count = countStr ? parseInt(countStr, 10) : 0;

    const badges = document.querySelectorAll('.badge');
    badges.forEach(b => {
        if (count > 0) {
            b.textContent = count;
            b.style.display = 'inline-block';
        } else {
            b.style.display = 'none';
        }
    });
})();

// Themed confirm dialog
function showConfirmDialog(title, message, onConfirm) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
    `;

    // Create modal box
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--bg-card, #1c1c1c);
        border: 1px solid var(--border-color, #2a2a2a);
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
    `;

    modal.innerHTML = `
        <h3 style="color: var(--text-main, #fff); margin: 0 0 12px; font-size: 18px; font-weight: 600;">${title}</h3>
        <p style="color: var(--text-muted, #9e9e9e); margin: 0 0 24px; line-height: 1.5;">${message}</p>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn-cancel" style="
                background: transparent;
                border: 1px solid var(--border-color, #2a2a2a);
                color: var(--text-muted, #9e9e9e);
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            ">Cancel</button>
            <button class="btn-confirm" style="
                background: #e74c3c;
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">Delete All</button>
        </div>
    `;

    // Add hover effects
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-confirm');
    cancelBtn.onmouseover = () => { cancelBtn.style.background = 'rgba(255,255,255,0.05)'; };
    cancelBtn.onmouseout = () => { cancelBtn.style.background = 'transparent'; };
    confirmBtn.onmouseover = () => { confirmBtn.style.background = '#c0392b'; };
    confirmBtn.onmouseout = () => { confirmBtn.style.background = '#e74c3c'; };

    // Event handlers
    cancelBtn.onclick = () => closeModal();
    confirmBtn.onclick = () => {
        closeModal();
        onConfirm();
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };

    function closeModal() {
        overlay.style.animation = 'fadeOut 0.2s ease-in';
        modal.style.animation = 'slideDown 0.2s ease-in';
        setTimeout(() => overlay.remove(), 200);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(20px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Helper for toast if not defined
function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log(`Toast [${type}]: ${message}`);
    }
}
