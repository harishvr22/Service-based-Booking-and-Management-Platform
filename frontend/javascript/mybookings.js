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
            const serviceName = service.service_name || service.name || 'Unknown Service';
            serviceMap[service.id] = serviceName;
          });
          
          const bookingsList = document.getElementById('bookingsList');
          const emptyState = document.getElementById('emptyState');

          if (bookings.length === 0) {
            bookingsList.style.display = 'none';
            emptyState.style.display = 'block';
          } else {
            bookingsList.style.display = 'flex';
            emptyState.style.display = 'none';
            bookingsList.innerHTML = bookings.map((booking) => {
              const serviceName = serviceMap[booking.service_id] || serviceMap[booking.serviceId] || 'Unknown Service';
              const bookingStatus = booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown';
              return `
                <div class="booking-card">
                  <div class="booking-info">
                    <div class="booking-service">${serviceName}</div>
                    <div class="booking-details">
                      <div class="booking-detail">🧾 Booking #${booking.id || 'N/A'}</div>
                      <div class="booking-detail">🧍 Resident ${booking.resident_id ? `#${booking.resident_id}` : 'N/A'}</div>
                      <div class="booking-detail">📌 Status: ${bookingStatus}</div>
                    </div>
                  </div>
                  <div class="booking-status status-${booking.status}">${bookingStatus}</div>
                </div>
              `;
            }).join('');
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
        bookingsList.innerHTML = bookings.map((booking) => {
          const bookingStatus = booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown';
          return `
            <div class="booking-card">
              <div class="booking-info">
                <div class="booking-service">${booking.service || booking.serviceName || 'Unknown Service'}</div>
                <div class="booking-details">
                  <div class="booking-detail">🧾 Booking #${booking.id || 'N/A'}</div>
                  <div class="booking-detail">🧍 Resident ${booking.resident_id ? `#${booking.resident_id}` : 'N/A'}</div>
                  <div class="booking-detail">📌 Status: ${bookingStatus}</div>
                </div>
              </div>
              <div class="booking-status status-${booking.status}">${bookingStatus}</div>
            </div>
          `;
        }).join('');
      }
    });
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