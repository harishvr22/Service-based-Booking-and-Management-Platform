document.addEventListener('DOMContentLoaded', () => {
  loadBookings();
  showClearButton();
});

function showClearButton() {
  // Only show clear history button for residents, not for service providers/admins
  const userRole = localStorage.getItem('userRole') || 'Resident';
  const clearButtonContainer = document.getElementById('clearButtonContainer');
  const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  
  if (userRole === 'Resident' && bookings.length > 0) {
    clearButtonContainer.style.display = 'block';
  }
}

function loadBookings() {
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