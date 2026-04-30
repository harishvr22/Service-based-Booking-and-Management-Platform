document.addEventListener('DOMContentLoaded', function () {
    // Sample Data (Same as in users.js for consistency in demo)
    const residents = [
        { name: 'John Doe', email: 'john@apt.com', phone: '+91 98765 00001', flat: 'A-101', block: 'A Block', moveIn: 'Jan 2024', status: 'Active' },
        { name: 'Jane Smith', email: 'jane@apt.com', phone: '+91 98765 00002', flat: 'B-205', block: 'B Block', moveIn: 'Mar 2024', status: 'Active' },
        { name: 'Mike Wilson', email: 'mike@apt.com', phone: '+91 98765 00003', flat: 'C-302', block: 'C Block', moveIn: 'Jun 2023', status: 'Active' },
        { name: 'Sara Lee', email: 'sara@apt.com', phone: '+91 98765 00004', flat: 'A-404', block: 'A Block', moveIn: 'Nov 2024', status: 'Active' },
        { name: 'Ravi Patel', email: 'ravi@apt.com', phone: '+91 98765 00005', flat: 'D-110', block: 'D Block', moveIn: 'Feb 2025', status: 'Inactive' },
        { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91 98765 43210', flat: 'A-302', block: 'A Block', moveIn: '15-01-2024', status: 'Active' }
    ];

    // Get logged in user info from localStorage
    const loggedInEmail = localStorage.getItem('userEmail') || 'rahul.sharma@email.com';

    // Find user in our "database"
    const user = residents.find(r => r.email === loggedInEmail) || residents[5]; // Fallback to Rahul Sharma if not found

    // Elements for editing
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const inputs = document.querySelectorAll('.form-grid input');
    let isEditing = false;
    let originalValues = {};

    editBtn.addEventListener('click', function () {
        if (!isEditing) {
            // Start Editing
            isEditing = true;
            editBtn.textContent = 'Save Changes';
            cancelBtn.style.display = 'block';

            inputs.forEach(input => {
                originalValues[input.id] = input.value;
                input.readOnly = false;
            });
            inputs[0].focus(); // Focus first field
        } else {
            // Save Changes
            saveProfile();
        }
    });

    cancelBtn.addEventListener('click', function () {
        // Cancel Editing
        isEditing = false;
        editBtn.textContent = 'Edit Profile';
        cancelBtn.style.display = 'none';

        inputs.forEach(input => {
            input.value = originalValues[input.id];
            input.readOnly = true;
        });
    });

    // Delete Account Handler (Using Custom Modal)
    const deleteModal = document.getElementById('deleteModal');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deletePasswordInput = document.getElementById('deletePassword');

    deleteAccountBtn.addEventListener('click', function () {
        deleteModal.classList.add('active');
        deletePasswordInput.value = '';
        deletePasswordInput.focus();
    });

    cancelDeleteBtn.addEventListener('click', function () {
        deleteModal.classList.remove('active');
    });

    // Close modal when clicking outside
    deleteModal.addEventListener('click', function (e) {
        if (e.target === deleteModal) {
            deleteModal.classList.remove('active');
        }
    });

    confirmDeleteBtn.addEventListener('click', function () {
        const password = deletePasswordInput.value;
        if (!password) {
            showNotification('Please enter your password to confirm.', 'error');
            return;
        }

        // Disable button while processing
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        fetch('http://localhost:5000/delete-account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: localStorage.getItem('userEmail'),
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' || data.message === 'Account deleted successfully') {
                showNotification('Account deleted successfully. You will be redirected to the login page.', 'success');
                localStorage.clear();
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showNotification('Error: ' + (data.message || data.error || 'Failed to delete account'), 'error');
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.textContent = 'Confirm Deletion';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('An error occurred while deleting the account. Please try again.', 'error');
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = 'Confirm Deletion';
        });
    });

    async function saveProfile() {
        const userId = localStorage.getItem('userId');
        const name = document.getElementById('dispName').value;
        const email = document.getElementById('dispEmail').value;
        const phone = document.getElementById('dispPhone').value;
        const flat = document.getElementById('dispFlat').value;
        const block = document.getElementById('dispBlock').value;
        const moveIn = document.getElementById('dispMoveIn').value;
        const emergencyName = document.getElementById('dispEmergencyName').value;
        const emergencyPhone = document.getElementById('dispEmergencyPhone').value;

        const apartment_id = block && flat ? `${block}|${flat}` : flat;

        try {
            const response = await fetch('http://127.0.0.1:5000/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    name,
                    email,
                    phone,
                    role: 'Resident', // Keep as resident
                    apartment_id,
                    availability: moveIn,
                    skills: emergencyName,
                    bio: emergencyPhone
                })
            });

            const result = await response.json();
            if (result.status === 'updated') {
                // Update UI
                document.getElementById('profileName').textContent = name;
                document.getElementById('profileEmail').textContent = email;

                // Update Initials
                const names = name.split(' ');
                const initials = names.map(n => n[0]).join('').toUpperCase().substring(0, 2);
                document.getElementById('avatarInitials').textContent = initials;

                // Save to localStorage
                localStorage.setItem('userName', name);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userPhone', phone);
                localStorage.setItem('userApartment', apartment_id);
                localStorage.setItem('userAvailability', moveIn);
                localStorage.setItem('userSkills', emergencyName);
                localStorage.setItem('userBio', emergencyPhone);

                // Reset UI state
                isEditing = false;
                editBtn.textContent = 'Edit Profile';
                cancelBtn.style.display = 'none';
                inputs.forEach(input => input.readOnly = true);

                showNotification('Profile updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile.', 'error');
        }
    }

    // Initial load from backend if available
    async function loadFromBackend() {
        const userId = localStorage.getItem('userId');
        if (userId) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/profile/${userId}`);
                const result = await response.json();
                if (result.status === 'success') {
                    const user = result.user;
                    
                    let flat = user.apartment_id || 'Not set';
                    let block = 'Not set';
                    if (flat.includes('|')) {
                        [block, flat] = flat.split('|');
                    }
                    
                    document.getElementById('profileName').textContent = user.name || 'Not set';
                    document.getElementById('profileEmail').textContent = user.email || 'Not set';
                    document.getElementById('dispName').value = user.name || 'Not set';
                    document.getElementById('dispEmail').value = user.email || 'Not set';
                    document.getElementById('dispPhone').value = user.phone || 'Not set';
                    document.getElementById('dispFlat').value = flat;
                    document.getElementById('dispBlock').value = block;
                    document.getElementById('dispMoveIn').value = user.availability || 'Not set';
                    document.getElementById('dispEmergencyName').value = user.skills || 'Not set';
                    document.getElementById('dispEmergencyPhone').value = user.bio || 'Not set';
                    
                    const names = (user.name || 'U').split(' ');
                    const initials = names.map(n => n[0]).join('').toUpperCase().substring(0,2);
                    document.getElementById('avatarInitials').textContent = initials;
                }
            } catch (error) {
                console.error("Error fetching profile from backend:", error);
                loadFromStorage();
            }
        } else {
            loadFromStorage();
        }
    }

    // Fallback logic
    function loadFromStorage() {
        if (localStorage.getItem('userEmail')) {
            document.getElementById('profileName').textContent = localStorage.getItem('userName') || user.name;
            document.getElementById('profileEmail').textContent = localStorage.getItem('userEmail') || user.email;
            document.getElementById('dispName').value = localStorage.getItem('userName') || user.name;
            document.getElementById('dispEmail').value = localStorage.getItem('userEmail') || user.email;
            document.getElementById('dispPhone').value = localStorage.getItem('userPhone') || user.phone || 'Not set';
            
            let apartment = localStorage.getItem('userApartment') || '';
            let flat = 'Not set';
            let block = 'Not set';
            if (apartment.includes('|')) {
                [block, flat] = apartment.split('|');
            } else {
                flat = apartment || 'Not set';
            }
            
            document.getElementById('dispFlat').value = flat;
            document.getElementById('dispBlock').value = block;
            document.getElementById('dispMoveIn').value = localStorage.getItem('userAvailability') || user.moveIn || 'Not set';
            document.getElementById('dispEmergencyName').value = localStorage.getItem('userSkills') || 'Not set';
            document.getElementById('dispEmergencyPhone').value = localStorage.getItem('userBio') || 'Not set';
            
            const name = localStorage.getItem('userName') || user.name;
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            document.getElementById('avatarInitials').textContent = initials;
        }
    }

    loadFromBackend();
});

function showNotification(message, type = 'info', duration = 3000) {
    // Remove any existing notifications
    const existing = document.querySelector('.notification-popup');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-popup notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;

    // Add CSS animation
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-popup {
                font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .notification-content i {
                font-size: 18px;
                flex-shrink: 0;
            }
            .notification-content span {
                flex: 1;
                font-weight: 500;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 2px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            .notification-close:hover {
                background: rgba(255,255,255,0.2);
            }
        `;
        document.head.appendChild(style);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}
