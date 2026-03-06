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

    function saveProfile() {
        const updatedData = {
            name: document.getElementById('dispName').value,
            email: document.getElementById('dispEmail').value,
            phone: document.getElementById('dispPhone').value,
            flat: document.getElementById('dispFlat').value,
            block: document.getElementById('dispBlock').value,
            moveIn: document.getElementById('dispMoveIn').value,
            emergencyName: document.getElementById('dispEmergencyName').value,
            emergencyPhone: document.getElementById('dispEmergencyPhone').value
        };

        // Update UI
        document.getElementById('profileName').textContent = updatedData.name;
        document.getElementById('profileEmail').textContent = updatedData.email;

        // Update Initials
        const names = updatedData.name.split(' ');
        const initials = names.map(n => n[0]).join('').toUpperCase();
        document.getElementById('avatarInitials').textContent = initials;

        // Save to localStorage
        localStorage.setItem('userName', updatedData.name);
        localStorage.setItem('userEmail', updatedData.email);
        localStorage.setItem('userPhone', updatedData.phone);
        localStorage.setItem('userFlat', updatedData.flat);
        localStorage.setItem('userBlock', updatedData.block);
        localStorage.setItem('userMoveIn', updatedData.moveIn);
        localStorage.setItem('emergencyName', updatedData.emergencyName);
        localStorage.setItem('emergencyPhone', updatedData.emergencyPhone);

        // Reset UI state
        isEditing = false;
        editBtn.textContent = 'Edit Profile';
        cancelBtn.style.display = 'none';
        inputs.forEach(input => input.readOnly = true);

        alert('Profile updated successfully!');
    }

    // Initial load from localStorage if available
    function loadFromStorage() {
        if (localStorage.getItem('userEmail')) {
            document.getElementById('profileName').textContent = localStorage.getItem('userName') || user.name;
            document.getElementById('profileEmail').textContent = localStorage.getItem('userEmail') || user.email;
            document.getElementById('dispName').value = localStorage.getItem('userName') || user.name;
            document.getElementById('dispEmail').value = localStorage.getItem('userEmail') || user.email;
            document.getElementById('dispPhone').value = localStorage.getItem('userPhone') || user.phone || 'Not set';
            document.getElementById('dispFlat').value = localStorage.getItem('userFlat') || user.flat || 'Not set';
            document.getElementById('dispBlock').value = localStorage.getItem('userBlock') || user.block || 'Not set';
            document.getElementById('dispMoveIn').value = localStorage.getItem('userMoveIn') || user.moveIn || 'Not set';
            document.getElementById('dispEmergencyName').value = localStorage.getItem('emergencyName') || 'Not set';
            document.getElementById('dispEmergencyPhone').value = localStorage.getItem('emergencyPhone') || 'Not set';

            const names = (localStorage.getItem('userName') || user.name).split(' ');
            const initials = names.map(n => n[0]).join('').toUpperCase();
            document.getElementById('avatarInitials').textContent = initials;
        }
    }

    loadFromStorage();
});
