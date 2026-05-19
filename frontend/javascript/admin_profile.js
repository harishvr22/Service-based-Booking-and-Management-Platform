document.addEventListener('DOMContentLoaded', async function () {
    const apiHost = window.location.hostname || '127.0.0.1';
    const API_BASE_URL = `http://${apiHost}:5000`;
    
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');

    // Default to 1 if no session exists (for easier local testing)
    const activeUserId = userId || 1;
    const activeUserRole = userRole || 'admin';

    // Logout handler
    document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    async function loadAdminProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/profile/${activeUserId}`);
            const data = await response.json();

            if (data.status === 'success') {
                const user = data.user;
                
                // Populate forms
                document.getElementById('adminName').value = user.name || '';
                document.getElementById('adminEmail').value = user.email || '';
                document.getElementById('adminPhone').value = user.phone || '';
                document.getElementById('adminRole').value = (user.role || 'Admin').toUpperCase();
                
                // Update sidebars and headers
                const initials = (user.name || 'Admin').substring(0, 2).toUpperCase();
                document.getElementById('sidebar-name').textContent = user.name;
                document.getElementById('sidebar-role').textContent = (user.role || 'Admin').toUpperCase();
                document.getElementById('sidebar-avatar').textContent = initials;
                
                document.getElementById('main-name').textContent = user.name;
                document.getElementById('main-avatar').textContent = initials;
            } else {
                showToast('Failed to load profile details', 'error');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            showToast('Connection error while loading profile', 'error');
        }
    }

    // Initial Load
    loadAdminProfile();

    // Handle Profile Update
    document.getElementById('profileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('adminName').value;
        const email = document.getElementById('adminEmail').value;
        const phone = document.getElementById('adminPhone').value;
        const role = document.getElementById('adminRole').value.toLowerCase();

        try {
            const response = await fetch(`${API_BASE_URL}/update-profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: activeUserId,
                    name: name,
                    email: email,
                    phone: phone,
                    role: role
                })
            });

            const data = await response.json();

            if (data.status === 'updated') {
                showToast('Profile updated successfully!');
                sessionStorage.setItem('userName', name); // Update local session name
                loadAdminProfile(); // Reload to refresh headers
            } else {
                showToast(data.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            showToast('An error occurred during update', 'error');
        }
    });

    // Handle Password Update
    document.getElementById('passwordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match!', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: activeUserId,
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (data.status === 'password_changed') {
                showToast('Password updated successfully!');
                document.getElementById('passwordForm').reset();
            } else {
                showToast(data.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            console.error('Password change error:', error);
            showToast('An error occurred while changing password', 'error');
        }
    });

    function showToast(message, type = 'success') {
        const toast = document.getElementById('profileToast');
        const msg = document.getElementById('toastMessage');
        const icon = document.getElementById('toastIcon');

        toast.className = 'toast ' + (type === 'error' ? 'error' : '');
        msg.textContent = message;
        icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';

        toast.style.display = 'flex';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
});
