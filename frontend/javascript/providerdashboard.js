// Load provider data from localStorage and backend
document.addEventListener('DOMContentLoaded', function () {
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');

    if (!userId) {
        // Fallback for testing or redirect
        console.log('No userId found in sessionStorage');
        // window.location.href = 'login.html';
    }

    // Update welcome name
    const displayName = sessionStorage.getItem('providerName') || sessionStorage.getItem('userName') || 'Provider';
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
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
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

            // Sync with sessionStorage for header.js
            sessionStorage.setItem('providerName', user.name);
        }
    } catch (error) {
        console.error('Error fetching dashboard profile:', error);
    }
}

async function fetchDashboardStats() {
    const userId = parseInt(sessionStorage.getItem('userId'));
    const userRole = sessionStorage.getItem('userRole') || ''; 
    const providerTrade = userRole.replace('Provider: ', '').trim();

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
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

    const userRole = sessionStorage.getItem('userRole') || ''; 
    const providerTrade = userRole.replace('Provider: ', '').trim();

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
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
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <h4 style="color: white; font-size: 15px; margin: 0;">${req.service_name || 'Service Request'}</h4>
                        <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase; background: ${
                            req.priority === 'critical' ? '#e74c3c' : 
                            req.priority === 'high' ? '#e67e22' : 
                            req.priority === 'medium' ? '#3498db' : '#2ecc71'
                        }; color: white;">${req.priority || 'medium'}</span>
                    </div>
                    <p style="color: #888; font-size: 12px;">
                        <i class="far fa-user"></i> ${req.resident_name || 'Resident #' + req.resident_id} &nbsp;•&nbsp; 
                        <i class="fas fa-map-marker-alt"></i> ${
                            req.apartment_id ? (
                                req.apartment_id.includes('|') ? `Block ${req.apartment_id.split('|')[0]} - Flat ${req.apartment_id.split('|')[1]}` :
                                req.apartment_id.includes('-') ? `Block ${req.apartment_id.split('-')[0]} - Flat ${req.apartment_id.split('-')[1]}` :
                                req.apartment_id
                            ) : 'N/A'
                        }
                    </p>
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

    const userId = parseInt(sessionStorage.getItem('userId'));

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
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
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

// Live Updates via Socket.IO
try {
    const socket = io(`${API_BASE_URL}`);
    socket.on('new_notification', function (data) {
        console.log('Live update triggered by notification:', data);
        const userId = sessionStorage.getItem('userId');
        const userRole = sessionStorage.getItem('userRole') || '';
        const providerTrade = userRole.replace('Provider: ', '').trim();
        
        // Refresh only if notification is relevant to providers
        if (data.audience === 'Providers' || data.audience === 'All') {
            fetchDashboardStats();
            fetchPendingRequests();
        }
    });
} catch (e) {
    console.log('Socket.IO not available for live updates');
}

// Modal Functions
window.openRaiseModal = function() {
  const modal = document.getElementById('raiseModal');
  document.getElementById('complaintTitle').value = '';
  document.getElementById('complaintDesc').value = '';
  modal.style.display = 'flex';
};

window.closeRaiseModal = function() {
  document.getElementById('raiseModal').style.display = 'none';
};

window.submitComplaint = function() {
  const userId = sessionStorage.getItem('userId');
  const title = document.getElementById('complaintTitle').value.trim();
  const description = document.getElementById('complaintDesc').value.trim();
  const priority = document.getElementById('complaintPriority').value;
  
  if (!userId) {
    alert('User session not found. Please log in again.');
    return;
  }
  
  if (!title || !description) {
    alert('Please fill in both subject and description.');
    return;
  }
  
  const submitBtn = document.querySelector('#raiseModal button[onclick="submitComplaint()"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'SUBMITTING...';
  submitBtn.disabled = true;
  
  const payload = {
    user_id: userId,
    title: title,
    description: description,
    priority: priority
  };
  
    fetch(`${API_BASE_URL}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Server error');
    }
    return data;
  })
  .then(data => {
    if (data.status === 'success') {
      alert('Complaint raised successfully. Admin will review it shortly.');
      closeRaiseModal();
    } else {
      alert('Error: ' + data.message);
    }
  })
  .catch(err => {
    console.error('Error submitting complaint:', err);
    alert('Failed to submit: ' + err.message);
  })
  .finally(() => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
};
