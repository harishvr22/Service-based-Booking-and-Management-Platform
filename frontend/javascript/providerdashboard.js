// Logout functionality
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn && logoutBtn.tagName === 'BUTTON') {
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'login.html';
        }
    });
}

// Toggle switch functionality
const statusToggle = document.getElementById('status-toggle');
const statusText = document.querySelector('.status-text');
const btnOffline = document.querySelector('.btn-offline');
const activeStatus = document.querySelector('.active-status');

statusToggle.addEventListener('change', function() {
    if (this.checked) {
        statusText.textContent = 'Available';
        btnOffline.textContent = 'Go Offline';
        activeStatus.textContent = 'Active';
        activeStatus.style.background = '#4CAF50';
    } else {
        statusText.textContent = 'Offline';
        btnOffline.textContent = 'Go Online';
        activeStatus.textContent = 'Inactive';
        activeStatus.style.background = '#999';
    }
});

// Go offline/online button
btnOffline.addEventListener('click', function() {
    statusToggle.checked = !statusToggle.checked;
    statusToggle.dispatchEvent(new Event('change'));
});

// Action card click handlers (for non-link cards)
document.querySelectorAll('.action-card:not(.action-link)').forEach(card => {
    card.addEventListener('click', function() {
        const title = this.querySelector('h4').textContent;
        
        if (title === 'Update Job Status') {
            alert('Navigating to Update Job Status...');
            // window.location.href = 'update-job-status.html';
        } else if (title === 'Job History') {
            alert('Navigating to Job History...');
            // window.location.href = 'job-history.html';
        }
    });
});

// Load provider data from localStorage (if available)
document.addEventListener('DOMContentLoaded', function() {
    const providerData = localStorage.getItem('providerData');
    
    if (providerData) {
        try {
            const data = JSON.parse(providerData);
            updateDashboardData(data);
        } catch (error) {
            console.log('No provider data found in localStorage');
        }
    }
});

// Function to update dashboard with data
function updateDashboardData(data) {
    // Update old block and new block
    if (data.name) {
        let oldName = document.querySelector('.provider-details h2');
        if (oldName) oldName.textContent = data.name;
        
        let newTitle = document.querySelector('.welcome-section h1');
        if (newTitle) newTitle.textContent = 'Hi, ' + data.name + '.';
    }
    
    if (data.role) {
        const roleElement = document.querySelector('.provider-role');
        if (roleElement) {
            roleElement.innerHTML = `<svg class="role-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12Z"></path>
                                <path d="M12 6v6l4 2"></path>
                            </svg>${data.role}<span class="rating">⭐ ${data.rating || '4.8'}</span>`;
        }
    }
    
    // Stats mapping modified to fit the new UI grid
    // New UI grid: [0]=NEW REQUESTS (Pending), [1]=IN PROGRESS (inProgress), [2]=COMPLETED (completed), [3]=AVG. RATING
    // The old grid expected [0]=totalJobs, [1]=pending, [2]=inProgress, [3]=completed
    const isNewUi = !!document.querySelector('.welcome-section h1');
    const statCards = document.querySelectorAll('.stat-card');
    
    if (isNewUi) {
        if (data.pending !== undefined && statCards[0]) statCards[0].querySelector('h3').textContent = data.pending;
        if (data.inProgress !== undefined && statCards[1]) statCards[1].querySelector('h3').textContent = data.inProgress;
        if (data.completed !== undefined && statCards[2]) statCards[2].querySelector('h3').textContent = data.completed;
        if (data.rating !== undefined && statCards[3]) statCards[3].querySelector('h3').textContent = data.rating;
    } else {
        if (data.totalJobs !== undefined && statCards[0]) statCards[0].querySelector('h3').textContent = data.totalJobs;
        if (data.pending !== undefined && statCards[1]) statCards[1].querySelector('h3').textContent = data.pending;
        if (data.inProgress !== undefined && statCards[2]) statCards[2].querySelector('h3').textContent = data.inProgress;
        if (data.completed !== undefined && statCards[3]) statCards[3].querySelector('h3').textContent = data.completed;
    }
}

console.log('Provider Dashboard loaded successfully with professional icons and toggle switch');
