/**
 * Provider Profile – Dynamic Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.warn('No userId found in localStorage, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    fetchProfile(userId);
    setupSaveButton(userId);
    setupDeleteAccount();
});

async function setupDeleteAccount() {
    const deleteBtn = document.getElementById('deleteAccountBtn');
    const deleteModal = document.getElementById('deleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deletePasswordInput = document.getElementById('deletePassword');

    if (!deleteBtn || !deleteModal) return;

    deleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('active');
        deletePasswordInput.value = '';
        deletePasswordInput.focus();
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    // Close modal on outside click
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) deleteModal.classList.remove('active');
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        const password = deletePasswordInput.value;
        if (!password) {
            alert('Please enter your password to confirm.');
            return;
        }

        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

        try {
            const response = await fetch('http://127.0.0.1:5000/delete-account', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: localStorage.getItem('userEmail'),
                    password: password
                })
            });

            const data = await response.json();
            if (data.status === 'success' || data.message === 'Account deleted successfully') {
                localStorage.clear();
                window.location.href = 'landingpage.html';
            } else {
                alert('Error: ' + (data.message || 'Failed to delete account'));
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.textContent = 'Delete Permanently';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = 'Delete Permanently';
        }
    });
}

async function fetchProfile(userId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/profile/${userId}`);
        const result = await response.json();

        if (result.status === 'success') {
            const user = result.user;

            // Update Left Panel
            if (document.getElementById('profileNameLarge')) document.getElementById('profileNameLarge').textContent = user.name;
            if (document.getElementById('profileRoleLarge')) document.getElementById('profileRoleLarge').textContent = user.role || 'Provider';
            if (document.getElementById('profileEmailLarge')) document.getElementById('profileEmailLarge').textContent = user.email;

            // Update Form
            const displayRole = user.role ? user.role.replace('Provider: ', '') : 'Electrician';
            if (document.getElementById('editFullName')) document.getElementById('editFullName').value = user.name;
            if (document.getElementById('editEmail')) document.getElementById('editEmail').value = user.email;
            if (document.getElementById('editPhone')) document.getElementById('editPhone').value = user.phone || '';
            if (document.getElementById('editRole')) document.getElementById('editRole').value = displayRole;
            if (document.getElementById('editAvailability')) document.getElementById('editAvailability').value = user.availability || 'Mon-Sat • 9 AM - 7 PM';
            if (document.getElementById('editSkills')) document.getElementById('editSkills').value = user.skills || 'General Service';
            if (document.getElementById('editBio')) document.getElementById('editBio').value = user.bio || 'Certified service provider.';

            // Sync avatar initials
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const avatarEl = document.getElementById('profileAvatarLarge');
            if (avatarEl) avatarEl.textContent = initials;

            // Sync localStorage
            localStorage.setItem('providerRole', user.role || 'Provider');

            // Fetch job stats for "JOBS DONE"
            fetchJobStats(userId);
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

async function fetchJobStats(userId) {
    try {
        const response = await fetch('http://127.0.0.1:5000/bookings');
        const bookings = await response.json();
        if (!Array.isArray(bookings)) throw new Error('Invalid data format');

        // Filter bookings for this specific provider and completed status
        const completed = bookings.filter(b =>
            b.provider_id == userId && b.status === 'completed'
        ).length;

        if (document.getElementById('jobsDoneCount')) {
            document.getElementById('jobsDoneCount').textContent = completed;
        }
    } catch (error) {
        console.error('Error fetching job stats:', error);
    }
}

function setupSaveButton(userId) {
    const saveBtn = document.querySelector('.btn-save-changes');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
        const name = document.getElementById('editFullName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const phone = document.getElementById('editPhone').value.trim();
        const role = document.getElementById('editRole').value;
        const availability = document.getElementById('editAvailability').value.trim();
        const skills = document.getElementById('editSkills').value.trim();
        const bio = document.getElementById('editBio').value.trim();

        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:5000/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    name,
                    email,
                    phone,
                    role: 'Provider: ' + role,
                    availability,
                    skills,
                    bio
                })
            });

            const result = await response.json();
            if (result.status === 'updated') {
                // Update localStorage to sync with header.js
                localStorage.setItem('providerName', name);
                localStorage.setItem('userName', name);
                localStorage.setItem('providerRole', role);

                // Show success
                saveBtn.textContent = 'Saved!';
                saveBtn.style.background = '#2ecc71';
                saveBtn.style.color = '#000';

                // Trigger sync across tabs
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'providerName',
                    newValue: name
                }));

                // Refresh UI
                fetchProfile(userId);

                setTimeout(() => {
                    saveBtn.textContent = 'Save Changes';
                    saveBtn.style.background = 'var(--orange)';
                    saveBtn.disabled = false;
                }, 2000);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            saveBtn.textContent = 'Error!';
            setTimeout(() => {
                saveBtn.textContent = 'Save Changes';
                saveBtn.disabled = false;
            }, 2000);
        }
    });
}
