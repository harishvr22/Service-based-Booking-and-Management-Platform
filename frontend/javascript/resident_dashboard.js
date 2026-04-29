document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
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
  const bookingList = document.querySelector('.booking-list');
  if (!bookingList) return;
  
  // Get upcoming bookings (approved or pending, sorted by date)
  const upcoming = bookings
    .filter(b => b.status === 'approved' || b.status === 'pending')
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
    const statusClass = status === 'approved' ? 'status-approved' : 'status-pending';
    const statusIcon = status === 'approved' ? 'check-circle' : 'clock';
    
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