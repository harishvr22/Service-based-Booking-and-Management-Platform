document.addEventListener('DOMContentLoaded', function () {
    const apiHost = window.location.hostname || '127.0.0.1';
    const API_BASE_URL = window.API_BASE_URL || `http://${apiHost}:5000`;
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || 1;

    // 1. Instantly update Admin Profile details from storage fallbacks
    const adminName = sessionStorage.getItem('userName') || localStorage.getItem('userName');
    const adminRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');

    function updateSidebarUI(name, role) {
        if (name) {
            const nameEls = document.querySelectorAll('.admin-info .name');
            nameEls.forEach(el => el.textContent = name);
            
            const avatarEls = document.querySelectorAll('.admin-avatar');
            avatarEls.forEach(el => el.textContent = name.substring(0, 2).toUpperCase());
        }
        if (role) {
            const roleEls = document.querySelectorAll('.admin-info .role');
            roleEls.forEach(el => el.textContent = role.toUpperCase());
        }
    }

    // Render initially with cached values if we have them
    updateSidebarUI(adminName, adminRole);

    // 2. Asynchronously fetch the latest profile to ensure consistency and sync storage
    fetch(`${API_BASE_URL}/profile/${userId}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.user) {
                const user = data.user;
                // Sync storage
                sessionStorage.setItem('userName', user.name);
                localStorage.setItem('userName', user.name);
                sessionStorage.setItem('userRole', user.role);
                localStorage.setItem('userRole', user.role);
                sessionStorage.setItem('userId', user.id);
                localStorage.setItem('userId', user.id);

                // Update UI to ensure it reflects latest name/role
                updateSidebarUI(user.name, user.role);
            }
        })
        .catch(err => {
            console.error("Error syncing admin profile in admin_common.js:", err);
        });

    // 3. Handle Logout properly
    const logoutBtns = document.querySelectorAll('.admin-logout a');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = 'login.html';
        });
    });
});
