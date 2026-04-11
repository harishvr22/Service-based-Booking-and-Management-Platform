document.addEventListener('DOMContentLoaded', function () {
    // Load current user data
    loadUserData();

    // Handle all save buttons
    const allSaveButtons = document.querySelectorAll('.btn-save');
    allSaveButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent any default form submission

            const card = this.closest('.settings-card');
            if (!card) return;

            const sectionTitle = card.querySelector('h3').textContent;

            if (sectionTitle === 'Admin Profile') {
                updateProfile();
            } else if (sectionTitle === 'Security') {
                changePassword();
            } else {
                // Handle other buttons with mock functionality
                handleMockSave(this, sectionTitle);
            }
        });
    });

    // Handle Toggle Switches
    const switches = document.querySelectorAll('.switch input');
    switches.forEach(sw => {
        sw.addEventListener('change', function () {
            const label = this.closest('.toggle-item').querySelector('h4').innerText;
            const status = this.checked ? 'Enabled' : 'Disabled';
            showToast(`${label}: ${status}`, 'info');
        });
    });
});

function loadUserData() {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    if (userName) {
        document.getElementById('adminName').value = userName;
        // Update display name
        const displayNameEl = document.querySelector('.avatar-info h4');
        if (displayNameEl) {
            displayNameEl.textContent = userName;
        }
        // Update avatar initials
        const avatarEl = document.querySelector('.avatar');
        if (avatarEl) {
            const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            avatarEl.textContent = initials;
        }
    }
    if (userEmail) {
        document.getElementById('adminEmail').value = userEmail;
    }
}

function updateProfile() {
    const userId = localStorage.getItem('userId');
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;

    if (!userId) {
        showToast('User not logged in', 'error');
        return;
    }

    const profileCard = Array.from(document.querySelectorAll('.settings-card')).find(card =>
        card.querySelector('h3').textContent === 'Admin Profile'
    );
    const button = profileCard ? profileCard.querySelector('.btn-save') : null;
    if (!button) return;

    const originalText = button.innerText;
    button.innerText = 'Updating...';
    button.disabled = true;

    fetch('http://localhost:5000/update-profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: parseInt(userId),
            name: name,
            email: email
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'updated') {
            // Update localStorage
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            // Update display
            const displayNameEl = document.querySelector('.avatar-info h4');
            if (displayNameEl) {
                displayNameEl.textContent = name;
            }
            const avatarEl = document.querySelector('.avatar');
            if (avatarEl) {
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                avatarEl.textContent = initials;
            }
            showToast('Profile updated successfully!', 'success');
        } else {
            showToast('Failed to update profile: ' + (data.message || 'Unknown error'), 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Failed to update profile. Please try again.', 'error');
    })
    .finally(() => {
        button.innerText = originalText;
        button.disabled = false;
    });
}

function changePassword() {
    const userId = localStorage.getItem('userId');
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    if (!userId) {
        showToast('User not logged in', 'error');
        return;
    }

    if (!currentPassword || !newPassword) {
        showToast('Please fill in all password fields', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters long', 'error');
        return;
    }

    const securityCard = Array.from(document.querySelectorAll('.settings-card')).find(card =>
        card.querySelector('h3').textContent === 'Security'
    );
    const button = securityCard ? securityCard.querySelector('.btn-save') : null;
    if (!button) return;

    const originalText = button.innerText;
    button.innerText = 'Changing...';
    button.disabled = true;

    fetch('http://localhost:5000/change-password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: parseInt(userId),
            current_password: currentPassword,
            new_password: newPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'password_changed') {
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            showToast('Password changed successfully!', 'success');
        } else {
            showToast('Failed to change password: ' + (data.message || 'Unknown error'), 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Failed to change password. Please try again.', 'error');
    })
    .finally(() => {
        button.innerText = originalText;
        button.disabled = false;
    });
}

function handleMockSave(button, sectionTitle) {
    const originalText = button.innerText;

    // Simple visual feedback on button
    button.innerText = 'Saving...';
    button.disabled = true;

    // Mock API call
    setTimeout(() => {
        button.innerText = originalText;
        button.disabled = false;
        showToast(`Success: ${sectionTitle} updated!`, 'success');
    }, 1000);
}

// Toast Notification Logic
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
