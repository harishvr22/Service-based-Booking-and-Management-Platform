document.addEventListener('DOMContentLoaded', function () {
    // 1. Update Admin Profile details dynamically
    const adminName = sessionStorage.getItem('userName');
    const adminRole = sessionStorage.getItem('userRole');

    if (adminName) {
        const nameEls = document.querySelectorAll('.admin-info .name');
        nameEls.forEach(el => el.textContent = adminName);
        
        const avatarEls = document.querySelectorAll('.admin-avatar');
        avatarEls.forEach(el => el.textContent = adminName.substring(0, 2).toUpperCase());
    }

    if (adminRole) {
        const roleEls = document.querySelectorAll('.admin-info .role');
        roleEls.forEach(el => el.textContent = adminRole.toUpperCase());
    }

    // 2. Handle Logout properly
    const logoutBtns = document.querySelectorAll('.admin-logout a');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    });
});
