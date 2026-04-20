document.addEventListener('DOMContentLoaded', function () {
    // Socket.IO connection
    const socket = io('http://localhost:5000');

    socket.on('new_notification', function(data) {
        console.log('New notification received:', data);
        // Add to localStorage for display
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
        
        // Optionally refresh the page or update UI
        location.reload(); // Simple way to refresh
    });
    const newAnnouncementBtn = document.getElementById('newAnnouncementBtn');
    const createAnnouncementFormSection = document.getElementById('createAnnouncementForm');
    const announcementForm = document.getElementById('announcementForm');
    const announcementsList = document.querySelector('.announcements-list');

    // Custom Dropdown Logic
    const dropdownSelect = document.querySelector('.dropdown-select');
    const dropdownList = document.querySelector('.dropdown-list');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const audienceInput = document.getElementById('audienceInput');
    const selectValue = document.querySelector('.select-value');

    if (dropdownSelect && dropdownList) {
        // Toggle Dropdown
        dropdownSelect.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdownList.classList.toggle('show');
            const icon = dropdownSelect.querySelector('i');
            if (icon) {
                if (dropdownList.classList.contains('show')) {
                    icon.className = 'fas fa-chevron-up';
                } else {
                    icon.className = 'fas fa-chevron-down';
                }
            }
        });

        // Select Item
        dropdownItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                // Remove selected class from all
                dropdownItems.forEach(i => {
                    i.classList.remove('selected');
                    const icon = i.querySelector('.check-icon');
                    if (icon) icon.style.opacity = '0';
                });

                // Add selected class to clicked
                this.classList.add('selected');
                const checkIcon = this.querySelector('.check-icon');
                if (checkIcon) checkIcon.style.opacity = '1';

                // Update Input and Display
                const value = this.getAttribute('data-value');
                if (audienceInput) audienceInput.value = value;
                if (selectValue) selectValue.textContent = value;

                // Close Dropdown
                dropdownList.classList.remove('show');
                const icon = dropdownSelect.querySelector('i');
                if (icon) icon.className = 'fas fa-chevron-down';
            });
        });

        // Close when clicking outside
        document.addEventListener('click', function () {
            dropdownList.classList.remove('show');
            const icon = dropdownSelect.querySelector('i');
            if (icon) icon.className = 'fas fa-chevron-down';
        });
    }

    // Toggle Form Visibility with Theme Matching Cancel Button
    if (newAnnouncementBtn && createAnnouncementFormSection) {
        newAnnouncementBtn.addEventListener('click', function () {
            if (createAnnouncementFormSection.style.display === 'none') {
                createAnnouncementFormSection.style.display = 'block';
                newAnnouncementBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
                newAnnouncementBtn.classList.remove('btn-primary');
                newAnnouncementBtn.classList.add('btn-cancel');
                // Remove inline styles if any remaining
                newAnnouncementBtn.style.border = '';
                newAnnouncementBtn.style.backgroundColor = '';
                newAnnouncementBtn.style.color = '';
            } else {
                createAnnouncementFormSection.style.display = 'none';
                newAnnouncementBtn.innerHTML = '<i class="fas fa-plus"></i> New Announcement';
                newAnnouncementBtn.classList.remove('btn-cancel');
                newAnnouncementBtn.classList.add('btn-primary');
            }
        });
    }

    // Handle Form Submission
    if (announcementForm) {
        announcementForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get Input Values
            const titleInput = announcementForm.querySelector('input[type="text"]');
            const messageInput = announcementForm.querySelector('textarea');
            const audience = audienceInput ? audienceInput.value : 'All Users';

            const title = titleInput.value.trim();
            const message = messageInput.value.trim();

            if (!title || !message) {
                alert('Please fill in all fields');
                return;
            }

            // Create Date String
            const date = new Date();
            const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
            const dateString = date.toLocaleDateString('en-US', dateOptions);

            // Determine Badge Class based on Audience
            let badgeClass = 'badge-purple'; // Default (Providers)
            let badgeStyle = 'background-color: #f3e5f5; color: #9c27b0;';
            let iconClass = 'fas fa-bullhorn'; // Default

            if (audience === 'Residents Only') {
                badgeClass = 'badge-green';
                badgeStyle = 'background-color: #e8f8f5; color: #2ecc71;';
                iconClass = 'fas fa-home';
            } else if (audience === 'All Users') {
                badgeClass = 'badge-blue';
                badgeStyle = 'background-color: #ebf5fb; color: #3498db;';
                iconClass = 'fas fa-globe';
            } else {
                // Providers Only
                badgeClass = 'badge-purple';
                badgeStyle = 'background-color: #f3e5f5; color: #9c27b0;';
                iconClass = 'fas fa-user-tie';
            }

            // Create New Announcement Card
            const newCard = document.createElement('div');
            newCard.className = 'announcement-card';
            newCard.style.animation = 'slideDown 0.3s ease-out';

            newCard.innerHTML = `
                <div class="announcement-header">
                    <div class="announcement-title">
                        <i class="${iconClass} text-orange"></i>
                        <h3>${title}</h3>
                        <span class="badge ${badgeClass}" style="${badgeStyle}">${audience}</span>
                    </div>
                    <button class="btn-icon delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
                <p class="announcement-text">${message}</p>
                <span class="announcement-date">${dateString}</span>
            `;

            // Send to backend
            fetch('http://localhost:5000/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    message: message,
                    audience: audience,
                    created_by: 1 // Assuming admin id is 1
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Announcement created:', data);
                // The real-time update will be handled by socket
            })
            .catch(error => {
                console.error('Error creating announcement:', error);
                alert('Failed to create announcement');
            });

            // Still save to localStorage for backward compatibility or immediate display
            const newNotif = {
                id: Date.now().toString(),
                title: title,
                message: message,
                audience: audience,
                date: new Date().toISOString(),
                read: false,
                iconClass: iconClass
            };
            let allNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
            allNotifs.unshift(newNotif);
            localStorage.setItem('admin_notifications', JSON.stringify(allNotifs));

            // Prepend to List
            if (announcementsList) {
                announcementsList.insertBefore(newCard, announcementsList.firstChild);
            }

            // Reset Form and Toggle Off
            announcementForm.reset();
            createAnnouncementFormSection.style.display = 'none';
            newAnnouncementBtn.innerHTML = '<i class="fas fa-plus"></i> New Announcement';
            newAnnouncementBtn.classList.remove('btn-cancel');
            newAnnouncementBtn.classList.add('btn-primary');

            // Reset Dropdown
            if (selectValue) selectValue.textContent = 'All Users';
            if (audienceInput) audienceInput.value = 'All Users';
            if (dropdownItems) {
                dropdownItems.forEach(i => {
                    i.classList.remove('selected');
                    const icon = i.querySelector('.check-icon');
                    if (icon) icon.style.opacity = '0';
                    if (i.dataset.value === 'All Users') {
                        i.classList.add('selected');
                        if (icon) icon.style.opacity = '1';
                    }
                });
            }
        });
    }

    // Handle Delete functionality using Event Delegation
    if (announcementsList) {
        announcementsList.addEventListener('click', function (e) {
            // Check if clicked element is a delete button or its icon
            if (e.target.closest('.delete-btn')) {
                const card = e.target.closest('.announcement-card');
                if (card) {
                    if (confirm('Are you sure you want to delete this announcement?')) {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(-10px)';
                        card.style.transition = 'all 0.3s';
                        setTimeout(() => {
                            card.remove();
                        }, 300);
                    }
                }
            }
        });
    }
});
