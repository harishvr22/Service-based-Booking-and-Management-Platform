document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const inputs = document.querySelectorAll('.form-grid input, .form-grid select, .form-grid textarea');
    const avatarInitials = document.getElementById('avatarInitials');
    const nameDisplay = document.getElementById('profileNameDisplay');
    const subInfoDisplay = document.getElementById('profileSubInfo');

    let isEditing = false;
    let originalValues = {};

    // Initial Data loading
    function loadProfile() {
        const data = {
            name: localStorage.getItem('provName') || 'Rajesh Kumar',
            email: localStorage.getItem('provEmail') || 'rajesh.kumar@email.com',
            phone: localStorage.getItem('provPhone') || '+91 99876 54321',
            category: localStorage.getItem('provCategory') || 'Plumber',
            specialization: localStorage.getItem('provSpecialization') || 'Pipe Fitting & Leak Repair',
            area: localStorage.getItem('provArea') || 'South Zone',
            experience: localStorage.getItem('provExperience') || '8',
            bio: localStorage.getItem('provBio') || 'Experienced plumber with 8+ years of expertise in residential pipe fitting, leak repair, and bathroom installations.',
            certifications: localStorage.getItem('provCertifications') || 'ISI Certified Plumber, Safety Training Certificate',
            hours: localStorage.getItem('provHours') || '9 AM - 6 PM'
        };

        // Populate UI
        document.getElementById('profName').value = data.name;
        document.getElementById('profEmail').value = data.email;
        document.getElementById('profPhone').value = data.phone;
        document.getElementById('profCategory').value = data.category;
        document.getElementById('profSpecialization').value = data.specialization;
        document.getElementById('profArea').value = data.area;
        document.getElementById('profExperience').value = data.experience;
        document.getElementById('profBio').value = data.bio;
        document.getElementById('profCertifications').value = data.certifications;
        document.getElementById('profHours').value = data.hours;

        updateStaticUI(data);
    }

    function updateStaticUI(data) {
        nameDisplay.textContent = data.name;
        subInfoDisplay.textContent = `${data.category} • ${data.area}`;

        // Initials
        const initials = data.name.split(' ').map(n => n[0]).join('').toUpperCase();
        avatarInitials.textContent = initials;
    }

    editBtn.addEventListener('click', function () {
        if (!isEditing) {
            startEditing();
        } else {
            saveChanges();
        }
    });

    cancelBtn.addEventListener('click', function () {
        stopEditing(true);
    });

    function startEditing() {
        isEditing = true;
        editBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        cancelBtn.style.display = 'block';

        inputs.forEach(input => {
            originalValues[input.id] = input.value;
            if (input.tagName === 'SELECT') {
                input.disabled = false;
            } else {
                input.readOnly = false;
            }
        });
        document.getElementById('profName').focus();
    }

    function stopEditing(revert = false) {
        isEditing = false;
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Profile';
        cancelBtn.style.display = 'none';

        inputs.forEach(input => {
            if (revert) {
                input.value = originalValues[input.id];
            }
            if (input.tagName === 'SELECT') {
                input.disabled = true;
            } else {
                input.readOnly = true;
            }
        });
    }

    function saveChanges() {
        const newData = {
            name: document.getElementById('profName').value,
            email: document.getElementById('profEmail').value,
            phone: document.getElementById('profPhone').value,
            category: document.getElementById('profCategory').value,
            specialization: document.getElementById('profSpecialization').value,
            area: document.getElementById('profArea').value,
            experience: document.getElementById('profExperience').value,
            bio: document.getElementById('profBio').value,
            certifications: document.getElementById('profCertifications').value,
            hours: document.getElementById('profHours').value
        };

        // Save to localStorage
        localStorage.setItem('provName', newData.name);
        localStorage.setItem('provEmail', newData.email);
        localStorage.setItem('provPhone', newData.phone);
        localStorage.setItem('provCategory', newData.category);
        localStorage.setItem('provSpecialization', newData.specialization);
        localStorage.setItem('provArea', newData.area);
        localStorage.setItem('provExperience', newData.experience);
        localStorage.setItem('provBio', newData.bio);
        localStorage.setItem('provCertifications', newData.certifications);
        localStorage.setItem('provHours', newData.hours);

        updateStaticUI(newData);
        stopEditing();
        alert('Provider profile updated successfully!');
    }

    loadProfile();
});
