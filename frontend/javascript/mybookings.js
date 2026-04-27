document.addEventListener('DOMContentLoaded', () => {
  loadBookings();
  showClearButton();
  setupFilters();
});

let globalBookings = [];
let globalServiceMap = null;

function showClearButton() {
  const clearButtonContainer = document.getElementById('clearButtonContainer');
  // For now, hide clear button since we're using backend
  clearButtonContainer.style.display = 'none';
}

function getServiceImage(serviceName) {
  if (!serviceName) return '../assets/apartment.jpg';
  const n = serviceName.toLowerCase();
  if (n.includes('plumb')) return '../assets/plumber.png';
  if (n.includes('electric')) return '../assets/electrical.png';
  if (n.includes('clean')) return '../assets/cleaning.png';
  if (n.includes('paint')) return '../assets/painting.png';
  if (n.includes('carpent')) return '../assets/carpentering.png';
  if (n.includes('ac ') || n.includes('hvac')) return '../assets/ac service.png';
  return '../assets/apartment.jpg'; 
}

const MOCK_BOOKINGS = [
  { id: 1, serviceName: 'Plumbing', status: 'approved', date: 'Apr 19, 2026 - 11:00 AM' },
  { id: 2, serviceName: 'Electrical Repair', status: 'pending', date: 'Apr 22, 2026 - 03:00 PM' },
  { id: 3, serviceName: 'Deep Cleaning', status: 'completed', date: 'Apr 14, 2026 - 09:00 AM' },
  { id: 4, serviceName: 'AC Service', status: 'completed', date: 'Apr 7, 2026 - 01:00 PM' }
];

function loadBookings() {
  console.log('Loading bookings...');
  fetch('http://localhost:5000/bookings')
    .then(response => {
      console.log('Bookings response status:', response.status);
      return response.json();
    })
    .then(bookings => {
      console.log('Bookings received:', bookings);
      
      // Backend now returns service_name directly, no need to fetch services
      globalBookings = bookings;
      globalServiceMap = null;
      renderBookingsList(globalBookings, globalServiceMap);
      hideLoadingSpinner();
    })
    .catch(error => {
      console.error('Error loading bookings:', error);
      // Fallback to cache or mock data
      const cached = localStorage.getItem('cachedBookings');
      if (cached) {
        globalBookings = JSON.parse(cached);
      } else {
        globalBookings = MOCK_BOOKINGS;
      }
      globalServiceMap = null;
      renderBookingsList(globalBookings, globalServiceMap);
      hideLoadingSpinner();
    });
}

function renderBookingsList(bookings, serviceMap) {
  const bookingsList = document.getElementById('bookingsList');
  const emptyState = document.getElementById('emptyState');
  const currentFilter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
  
  console.log('renderBookingsList called with:', bookings);
  console.log('Current filter:', currentFilter);

  if (!bookings || bookings.length === 0) {
    bookingsList.style.display = 'none';
    emptyState.style.display = 'block';
    hideLoadingSpinner();
    return;
  }

  // Filter bookings based on current filter
  const filteredBookings = bookings.filter(booking => {
    const status = normalizeStatus(booking.status);
    return currentFilter === 'all' || status === currentFilter;
  });
  
  console.log('Filtered bookings:', filteredBookings);

  if (filteredBookings.length === 0) {
    bookingsList.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.innerHTML = `
      <div class="empty-state">
        <i class="far fa-calendar-times" style="font-size: 48px; color: #666; margin-bottom: 16px;"></i>
        <p style="color: #999; font-size: 16px;">No ${currentFilter} bookings found</p>
      </div>
    `;
    hideLoadingSpinner();
    return;
  }

  bookingsList.style.display = 'flex';
  bookingsList.style.flexDirection = 'column';
  emptyState.style.display = 'none';
  
  bookingsList.innerHTML = filteredBookings.map((booking, index) => {
    // Use service_name from backend if available, otherwise fallback
    const sName = booking.service_name || booking.serviceName || 'Unknown Service';
      const statusRaw = booking.status || 'unknown';
      const bStatus = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1);
      const imgPath = getServiceImage(sName);
      
      const dateStr = booking.date && booking.time ? `${booking.date} - ${booking.time}` : (booking.date || `Apr ${10 + index}, 2026 - 11:00 AM`);
      
      let reviewSection = '';
      if (bStatus.toLowerCase() === 'completed') {
        if (sName.toLowerCase().includes('ac ')) {
           reviewSection = `
             <div class="booking-rating">
               <span class="stars">★★★★★</span>
               "Quick and professional. Highly recommend!"
             </div>
           `;
        }
      }
      
      let actionsHTML = `
        <div class="item-status status-${statusRaw.toLowerCase()}">
          <i class="far fa-${bStatus.toLowerCase() === 'completed' ? 'check-circle' : bStatus.toLowerCase() === 'pending' ? 'clock' : 'check-circle'}"></i> 
          ${bStatus}
        </div>
      `;
      
      if (bStatus.toLowerCase() === 'completed' && sName.toLowerCase().includes('clean')) {
         actionsHTML += `<button class="btn-review">LEAVE REVIEW</button>`;
      }

      return `
        <div class="list-item">
          <div class="item-img"><img src="${imgPath}" alt="${sName}"></div>
          <div class="item-details">
            <h4>${sName}</h4>
            <p>${dateStr}</p>
            ${reviewSection}
          </div>
          <div class="item-actions">
            ${actionsHTML}
          </div>
        </div>
      `;
    }).join('');
  }
}

function setupFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      const btn = e.target;
      btn.classList.add('active');
      
      // Re-render with current bookings (filtering happens inside renderBookingsList)
      renderBookingsList(globalBookings, globalServiceMap);
    });
  });
}

function normalizeStatus(status) {
  if (!status) return 'unknown';
  const s = status.toLowerCase();
  if (s.includes('approv') || s.includes('accept')) return 'approved';
  if (s.includes('pend')) return 'pending';
  if (s.includes('complet')) return 'completed';
  if (s.includes('in progress') || s.includes('progress')) return 'in progress';
  if (s.includes('cancel')) return 'cancelled';
  return status;
}

function clearHistory() {
  const confirmDelete = confirm('Are you sure you want to clear all your booking history? This action cannot be undone.');
  
  if (confirmDelete) {
    localStorage.removeItem('bookings');
    showNotification('Your booking history has been cleared.', 'success');
    location.reload(); 
  }
}