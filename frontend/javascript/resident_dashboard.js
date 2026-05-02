document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'Guest';
  
  // Set user name in UI
  const userNameEls = document.querySelectorAll('.user-name');
  userNameEls.forEach(el => el.textContent = userName);
  
  if (!userId) {
    console.error('No userId found. User might not be logged in.');
    return;
  }

  // Fetch dashboard data from backend
  Promise.all([
    fetch(`http://localhost:5000/bookings?resident_id=${userId}`).then(r => r.ok ? r.json() : []),
    fetch('http://localhost:5000/services').then(r => r.ok ? r.json() : [])
  ])
    .then(([bookings, services]) => {
      // Update stats
      updateStats(bookings);

      // Update upcoming bookings
      updateUpcomingBookings(bookings);

      // Update services grid
      updateServicesGrid(services);
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
    });
});

function updateStats(bookings) {
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    avgRating: bookings.filter(b => b.rating).reduce((sum, b) => sum + b.rating, 0) / bookings.filter(b => b.rating).length || 0
  };

  const statCards = document.querySelectorAll('.stat-card h3');
  if (statCards[0]) statCards[0].textContent = stats.total;
  if (statCards[1]) statCards[1].textContent = stats.pending;
  if (statCards[2]) statCards[2].textContent = stats.completed;
  if (statCards[3]) statCards[3].textContent = stats.avgRating.toFixed(1);
}

function updateUpcomingBookings(bookings) {
  const bookingList = document.getElementById('upcomingBookingsList');
  if (!bookingList) return;
  
  // Get upcoming bookings (approved or pending, sorted by date)
  const upcoming = bookings
    .filter(b => b.status === 'approved' || b.status === 'pending' || b.status === 'accepted')
    .sort((a, b) => new Date(a.date || '0') - new Date(b.date || '0'))
    .slice(0, 3); // Show max 3
  
  bookingList.innerHTML = '';
  
  if (upcoming.length === 0) {
    bookingList.innerHTML = '<div class="empty-state">No upcoming bookings</div>';
    return;
  }
  
  upcoming.forEach(booking => {
    const serviceName = booking.service_name || booking.serviceName || 'Service';
    const dateStr = booking.date || 'TBD';
    const status = booking.status || 'pending';
    const statusClass = (status === 'approved' || status === 'accepted') ? 'status-approved' : 'status-pending';
    const statusIcon = (status === 'approved' || status === 'accepted') ? 'check-circle' : 'clock';
    
    const bookingEl = document.createElement('div');
    bookingEl.className = 'list-item';
    bookingEl.innerHTML = `
      <div class="item-img"><img src="${getServiceImage(serviceName)}" alt="${serviceName}"></div>
      <div class="item-details">
        <h4>${serviceName}</h4>
        <p>${dateStr}</p>
      </div>
      <div class="item-status ${statusClass}">
        <i class="far fa-${statusIcon}"></i> ${status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    `;
    bookingList.appendChild(bookingEl);
  });
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
  const userId = localStorage.getItem('userId');
  const title = document.getElementById('complaintTitle').value.trim();
  const description = document.getElementById('complaintDesc').value.trim();
  const priority = document.getElementById('complaintPriority').value;
  
  if (!userId) {
    alert('User session not found. Please log in again.');
    console.error('Submit Complaint failed: userId is null');
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
  
  console.log('Submitting complaint:', payload);
  
  fetch('http://localhost:5000/complaints', {
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
      alert('Complaint raised successfully. Our team will review it shortly.');
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

function updateServicesGrid(services) {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;

  servicesGrid.innerHTML = '';
  services.forEach(service => {
    const serviceName = service.service_name || service.name || 'Unknown Service';
    const serviceCard = document.createElement('a');
    serviceCard.href = `servicebooking.html?service=${encodeURIComponent(serviceName)}`;
    serviceCard.className = 'service-card';
    serviceCard.innerHTML = `
      <div class="icon">${getServiceIcon(serviceName)}</div>
      <h3>${serviceName}</h3>
      <p>${service.description || 'Professional service'}</p>
    `;
    servicesGrid.appendChild(serviceCard);
  });
}

function getServiceIcon(serviceName) {
  const icons = {
    'Plumber': '🔧',
    'Electrician': '⚡',
    'Carpenter': '🪚',
    'Painter': '🎨',
    'Cleaner': '✨',
    'HVAC': '🌬️',
    'Locksmith': '🔑',
    'Pest Control': '🐞'
  };
  return icons[serviceName] || '🛠️';
}

function getServiceImage(serviceName) {
  if (!serviceName) return '../assets/apartment.jpg';
  const n = serviceName.toLowerCase();
  if (n.includes('plumb')) return '../assets/plumber.png';
  if (n.includes('electric')) return '../assets/electrical.png';
  if (n.includes('clean')) return '../assets/cleaning.png';
  if (n.includes('paint')) return '../assets/painting.png';
  if (n.includes('carpent')) return '../assets/carpentering.png';
  if (n.includes('ac') || n.includes('hvac') || n.includes('air condition')) return '../assets/ac service.png';
  return '../assets/apartment.jpg';
}