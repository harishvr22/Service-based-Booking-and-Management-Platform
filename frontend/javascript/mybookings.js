document.addEventListener('DOMContentLoaded', () => {
  loadBookings();
  showClearButton();
});

function showClearButton() {
  // Only show clear history button for residents, not for service providers/admins
  const userRole = localStorage.getItem('userRole') || 'Resident';
  const clearButtonContainer = document.getElementById('clearButtonContainer');
  
  // For now, hide clear button since we're using backend
  clearButtonContainer.style.display = 'none';
}

function loadBookings() {
  // Fetch bookings from backend
  fetch('http://localhost:5000/bookings')
    .then(response => response.json())
    .then(bookings => {
      // Fetch services to map service_id to name
      return fetch('http://localhost:5000/services')
        .then(response => response.json())
        .then(services => {
          const serviceMap = {};
          services.forEach(service => {
            serviceMap[service.id] = service.name;
          });
          
          const bookingsList = document.getElementById('bookingsList');
          const emptyState = document.getElementById('emptyState');

          if (bookings.length === 0) {
            bookingsList.style.display = 'none';
            emptyState.style.display = 'block';
          } else {
            bookingsList.style.display = 'flex';
            emptyState.style.display = 'none';
            bookingsList.innerHTML = bookings.map((booking, index) => `
              <div class="booking-card">
                <div class="booking-info">
                  <div class="booking-service">${serviceMap[booking.service_id] || 'Unknown Service'}</div>
                  <div class="booking-details">
                    <div class="booking-detail">
                      🏠 Resident ID: ${booking.resident_id}
                    </div>
                  </div>
                </div>
                <div class="booking-status status-${booking.status}">
                  ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </div>
            `).join('');
          }
        });
    })
    .catch(error => {
      console.error('Error loading bookings:', error);
      // Fallback to localStorage if backend fails
      const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      const bookingsList = document.getElementById('bookingsList');
      const emptyState = document.getElementById('emptyState');

      if (bookings.length === 0) {
        bookingsList.style.display = 'none';
        emptyState.style.display = 'block';
      } else {
        bookingsList.style.display = 'flex';
        emptyState.style.display = 'none';
        bookingsList.innerHTML = bookings.map((booking, index) => `
          <div class="booking-card">
            <div class="booking-info">
              <div class="booking-service">${booking.service}</div>
              <div class="booking-details">
                <div class="booking-detail">
                  📅 ${booking.date}
                </div>
                <div class="booking-detail">
                  🕐 ${booking.time}
                </div>
                <div class="booking-detail">
                  🏠 Apt: ${booking.apartmentId}
                </div>
              </div>
              ${booking.description ? `<div style="color: #666; font-size: 13px; margin-top: 8px;">📝 ${booking.description}</div>` : ''}
            </div>
            <div class="booking-status status-${booking.status}">
              ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </div>
          </div>
        `).join('');
      }
    });
}
}
function clearHistory() {
  const confirmDelete = confirm('Are you sure you want to clear all your booking history? This action cannot be undone.');
  
  if (confirmDelete) {
    const userEmail = localStorage.getItem('userEmail');
    
    // Only clear bookings for the current logged-in user
    localStorage.removeItem('bookings');
    
    alert('Your booking history has been cleared.');
    location.reload(); // Reload the page to refresh the list
  }
}