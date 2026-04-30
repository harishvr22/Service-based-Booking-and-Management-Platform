// Load provider data from localStorage and backend
document.addEventListener('DOMContentLoaded', function () {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (!userId) {
        // Fallback for testing or redirect
        console.log('No userId found in localStorage');
        // window.location.href = 'login.html';
    }

    // Update welcome name
    const displayName = localStorage.getItem('providerName') || localStorage.getItem('userName') || 'Provider';
    const nameEl = document.getElementById('providerName');
    if (nameEl) nameEl.textContent = 'Hi, ' + displayName + '.';

    // Basic dashboard data fetching
    if (userId) fetchProfile(userId);
    fetchDashboardStats();
    fetchPendingRequests();
    fetchRecentHistory();
});

async function fetchProfile(userId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/profile/${userId}`);
        const result = await response.json();

        if (result.status === 'success') {
            const user = result.user;
            
            // Update Dashboard Welcome Name
            const nameEl = document.getElementById('providerName');
            if (nameEl) nameEl.textContent = 'Hi, ' + user.name + '.';

            // Update Role
            const roleEl = document.getElementById('providerRole');
            if (roleEl) {
                roleEl.innerHTML = `<i class="fas fa-tools"></i> ${user.role || 'Provider'}`;
            }

            // Sync with localStorage for header.js
            localStorage.setItem('providerName', user.name);
        }
    } catch (error) {
        console.error('Error fetching dashboard profile:', error);
    }
}

async function fetchDashboardStats() {
    const userId = parseInt(localStorage.getItem('userId'));
    const userRole = localStorage.getItem('userRole') || ''; 
    const providerTrade = userRole.replace('Provider: ', '').trim();

    try {
        const response = await fetch('http://127.0.0.1:5000/bookings');
        if (!response.ok) throw new Error('Server error');
        const bookings = await response.json();

        if (!Array.isArray(bookings)) return;

        // Filter: Pending requests for this trade, Assigned work for this provider
        const pending = bookings.filter(b => b.status === 'pending' && b.service_name === providerTrade).length;
        const myBookings = bookings.filter(b => (b.provider_id == userId));
        const inProgress = myBookings.filter(b => b.status === 'accepted' || b.status === 'in-progress').length;
        const completed = myBookings.filter(b => b.status === 'completed').length;

        const ratedBookings = myBookings.filter(b => b.rating);
        const avgRating = ratedBookings.length ? (ratedBookings.reduce((sum, b) => sum + b.rating, 0) / ratedBookings.length).toFixed(1) : '0.0';

        if (document.getElementById('newRequestsCount')) document.getElementById('newRequestsCount').textContent = pending;
        if (document.getElementById('inProgressCount')) document.getElementById('inProgressCount').textContent = inProgress;
        if (document.getElementById('completedCount')) document.getElementById('completedCount').textContent = completed;
        if (document.getElementById('avgRating')) document.getElementById('avgRating').textContent = avgRating;
        if (document.getElementById('jobsCompleted')) document.getElementById('jobsCompleted').textContent = completed;
        
        const rate = myBookings.length > 0 ? Math.round((completed / myBookings.length) * 100) : 100;
        if (document.getElementById('acceptanceRate')) document.getElementById('acceptanceRate').textContent = rate + '%';
        if (document.getElementById('avgResponse')) document.getElementById('avgResponse').textContent = 'Live';
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

async function fetchPendingRequests() {
    const list = document.getElementById('pendingRequestsList');
    if (!list) return;

    const userRole = localStorage.getItem('userRole') || ''; 
    const providerTrade = userRole.replace('Provider: ', '').trim();

    try {
        const response = await fetch('http://127.0.0.1:5000/bookings');
        if (!response.ok) throw new Error('Server error');
        const bookings = await response.json();

        if (!Array.isArray(bookings)) throw new Error('Invalid data format');

        // Show pending requests that match the provider's trade
        const pendingBookings = bookings.filter(b => b.status === 'pending' && b.service_name === providerTrade).slice(0, 3);

        if (pendingBookings.length === 0) {
            list.innerHTML = '<p style="color: #888; font-size: 14px; text-align: center; padding: 20px;">No pending requests for your category.</p>';
            return;
        }

        list.innerHTML = '';
        pendingBookings.forEach(req => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 1px solid #222;';
            item.innerHTML = `
                <div>
                    <h4 style="color: white; font-size: 15px; margin-bottom: 4px;">${req.service_name || 'Service Request'}</h4>
                    <p style="color: #888; font-size: 12px;"><i class="far fa-user"></i> Resident #${req.resident_id} &nbsp;•&nbsp; <i class="fas fa-map-marker-alt"></i> ${req.apartment_id || 'N/A'}</p>
                </div>
                <a href="ServiceRequests.html" style="background: rgba(255,140,0,0.1); color: var(--orange); border: 1px solid rgba(255,140,0,0.3); padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">Review</a>
            `;
            list.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        list.innerHTML = '<p style="color: #666; font-size: 14px; text-align: center; padding: 20px;">No pending requests.</p>';
    }
}

async function fetchRecentHistory() {
    const list = document.getElementById('recentHistoryList');
    if (!list) return;

    const userId = parseInt(localStorage.getItem('userId'));

    try {
        const response = await fetch('http://127.0.0.1:5000/bookings');
        if (!response.ok) throw new Error('Server error');
        const bookings = await response.json();

        if (!Array.isArray(bookings)) throw new Error('Invalid data format');

        // Show only history for THIS provider
        const completedBookings = bookings.filter(b => b.status === 'completed' && b.provider_id == userId).slice(0, 3);

        if (completedBookings.length === 0) {
            list.innerHTML = '<p style="color: #888; font-size: 14px; text-align: center; padding: 20px;">No completed jobs found.</p>';
            return;
        }

        list.innerHTML = '';
        completedBookings.forEach(req => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 1px solid #222;';
            item.innerHTML = `
                <div>
                    <h4 style="color: white; font-size: 15px; margin-bottom: 4px;">${req.service_name || 'Service Request'}</h4>
                    <p style="color: #888; font-size: 12px;"><i class="fas fa-check-circle" style="color: #2ecc71;"></i> Completed &nbsp;•&nbsp; ${req.preferred_date || 'N/A'}</p>
                </div>
                <a href="JobHistory.html" style="color: #888; font-size: 18px;"><i class="fas fa-chevron-right"></i></a>
            `;
            list.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        list.innerHTML = '<p style="color: #666; font-size: 14px; text-align: center; padding: 20px;">No recent history.</p>';
    }
}

// Logout functionality
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            window.location.href = 'landingpage.html';
        }
    });
}
