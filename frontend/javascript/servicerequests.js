/**
 * Service Requests Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  loadServiceRequests();
});

// Update Job Status Button Handler
document.querySelector('.update-status-btn')?.addEventListener('click', () => {
    window.location.href = 'UpdateJobStatus.html';
});

function loadServiceRequests() {
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
          
          const requestsList = document.querySelector('.requests-list');
          requestsList.innerHTML = ''; // Clear existing
          
          bookings.forEach(booking => {
            const requestCard = document.createElement('div');
            requestCard.className = 'request-card';
            requestCard.innerHTML = `
              <div class="request-header">
                <div class="request-info">
                  <h3>${serviceMap[booking.service_id] || 'Unknown Service'}</h3>
                  <p class="resident-info">Resident ID: ${booking.resident_id}</p>
                </div>
                <span class="status-badge ${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
              </div>
              <div class="request-actions">
                <button class="btn-accept" data-booking-id="${booking.id}">Accept</button>
                <button class="btn-reject" data-booking-id="${booking.id}">Reject</button>
              </div>
            `;
            requestsList.appendChild(requestCard);
          });
          
          // Add event listeners for accept/reject buttons
          attachActionListeners();
        });
    })
    .catch(error => {
      console.error('Error loading service requests:', error);
    });
}

function attachActionListeners() {
  // Accept Button Handlers
  document.querySelectorAll('.btn-accept').forEach((btn) => {
    btn.addEventListener('click', function() {
      const bookingId = this.getAttribute('data-booking-id');
      updateBookingStatus(bookingId, 'accepted');
    });
  });

  // Reject Button Handlers
  document.querySelectorAll('.btn-reject').forEach((btn) => {
    btn.addEventListener('click', function() {
      const bookingId = this.getAttribute('data-booking-id');
      updateBookingStatus(bookingId, 'rejected');
    });
  });
}

function updateBookingStatus(bookingId, status) {
  fetch('http://localhost:5000/update-status', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      booking_id: bookingId,
      status: status
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'updated') {
      showNotification(`Request ${status} successfully!`, 'success');
      loadServiceRequests(); // Reload the list
    } else {
      showNotification('Failed to update status', 'error');
    }
  })
  .catch(error => {
    console.error('Error updating status:', error);
    showNotification('Failed to update status', 'error');
  });
}

/**
 * Disable action buttons for a request card
 * @param {HTMLElement} requestCard - The request card element
 */
function disableActionButtons(requestCard) {
    const actionsDiv = requestCard.querySelector('.request-actions');
    if (actionsDiv) {
        actionsDiv.style.display = 'none';
    }
}

/**
 * Show notification message
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        background-color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add style animation
    const style = document.createElement('style');
    if (!document.querySelector('style[data-notification]')) {
        style.setAttribute('data-notification', 'true');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Service Requests page initialized');
});
