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
  if (n.includes('ac') || n.includes('hvac') || n.includes('air condition')) return '../assets/ac service.png';
  return '../assets/apartment.jpg'; 
}

// Removed MOCK_BOOKINGS for real DB integration


function loadBookings() {
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    console.error('No userId found. User might not be logged in.');
    globalBookings = [];
    renderBookingsList(globalBookings, globalServiceMap);
    return;
  }

  console.log('Loading bookings for user:', userId);
  fetch(`http://localhost:5000/bookings?resident_id=${userId}`)
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
    })
    .catch(error => {
      console.error('Error loading bookings:', error);
      globalBookings = [];
      renderBookingsList(globalBookings, globalServiceMap);
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
      
      const dateStr = booking.preferred_date && booking.preferred_time ? `${booking.preferred_date} - ${booking.preferred_time}` : (booking.preferred_date || 'Date TBD');
      
      let reviewSection = '';
      if (bStatus.toLowerCase() === 'completed') {
         if (booking.review || booking.rating) {
             const rating = booking.rating || 5;
             const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
             reviewSection = `
               <div class="booking-rating">
                 <span class="stars">${stars}</span>
                 "${booking.review || ''}"
               </div>
             `;
         } else {
             reviewSection = `
               <div class="booking-rating" style="margin-top: 10px;">
                 <button class="btn-review" onclick="openReviewModal(${booking.id})" style="background: var(--orange); border: none; padding: 6px 12px; border-radius: 4px; font-weight: 600; cursor: pointer;">Leave Feedback</button>
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


      return `
        <div class="list-item">
          <div class="item-img"><img src="${imgPath}" alt="${sName}"></div>
          <div class="item-details">
            <h4>${sName}</h4>
            <p><i class="far fa-calendar-alt"></i> ${dateStr}</p>
            <p class="problem-summary" style="font-size: 13px; color: #aaa; margin-top: 5px; font-style: italic;">
              "${booking.problem_description || 'No description provided'}"
            </p>
            ${reviewSection}
          </div>
          <div class="item-actions">
            ${actionsHTML}
            <button class="delete-btn" onclick="deleteBooking(${booking.id})" style="background: none; border: none; color: #e74c3c; cursor: pointer; margin-left: 10px; font-size: 16px;" title="Delete Booking">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
}

function deleteBooking(bookingId) {
  showConfirmDialog(
    'Delete Booking',
    'Are you sure you want to delete this booking record? This action cannot be undone.',
    () => {
      fetch(`http://localhost:5000/bookings/${bookingId}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            loadBookings();
            showToast('Booking deleted successfully', 'success');
          } else {
            showToast('Error: ' + data.message, 'error');
          }
        })
        .catch(error => {
          console.error('Error deleting booking:', error);
          showToast('Failed to delete booking', 'error');
        });
    }
  );
}

// Themed Confirm Dialog
function showConfirmDialog(title, message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.7); z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.2s ease-out;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 12px;
    padding: 24px; max-width: 400px; width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease-out;
  `;

  modal.innerHTML = `
    <h3 style="color: #fff; margin: 0 0 12px; font-size: 18px; font-weight: 600;">${title}</h3>
    <p style="color: #9e9e9e; margin: 0 0 24px; line-height: 1.5; font-size: 14px;">${message}</p>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button class="btn-cancel" style="
        background: transparent; border: 1px solid #2a2a2a; color: #9e9e9e;
        padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.2s;
      ">Cancel</button>
      <button class="btn-confirm" style="
        background: #e74c3c; border: none; color: white;
        padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s;
      ">Delete</button>
    </div>
  `;

  const closeModal = () => {
    overlay.style.animation = 'fadeOut 0.2s ease-in';
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  modal.querySelector('.btn-cancel').onclick = closeModal;
  modal.querySelector('.btn-confirm').onclick = () => {
    closeModal();
    onConfirm();
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  if (!document.getElementById('modal-animations')) {
    const style = document.createElement('style');
    style.id = 'modal-animations';
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    `;
    document.head.appendChild(style);
  }
}

// Custom Toast Notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 30px; right: 30px;
    background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
    color: white; padding: 12px 24px; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10001;
    font-size: 14px; font-weight: 500;
    animation: slideInRight 0.3s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);

  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    `;
    document.head.appendChild(style);
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
    sessionStorage.removeItem('bookings');
    showNotification('Your booking history has been cleared.', 'success');
    location.reload(); 
  }
}

function openReviewModal(bookingId) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.7); z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.2s ease-out;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 12px;
    padding: 24px; max-width: 400px; width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease-out;
  `;

  modal.innerHTML = `
    <h3 style="color: #fff; margin: 0 0 12px; font-size: 18px; font-weight: 600;">Rate Service</h3>
    <p style="color: #9e9e9e; margin: 0 0 15px; font-size: 14px;">Please rate the provider and leave a review.</p>
    
    <div style="margin-bottom: 20px;">
      <label style="color: #fff; display: block; margin-bottom: 8px;">Rating (1-5)</label>
      <input type="number" id="review-rating" min="1" max="5" value="5" style="width: 100%; background: #2a2a2a; border: 1px solid #333; color: white; padding: 10px; border-radius: 6px;" />
    </div>
    <div style="margin-bottom: 20px;">
      <label style="color: #fff; display: block; margin-bottom: 8px;">Review</label>
      <textarea id="review-text" rows="3" placeholder="How was the service?" style="width: 100%; background: #2a2a2a; border: 1px solid #333; color: white; padding: 10px; border-radius: 6px;"></textarea>
    </div>

    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button class="btn-cancel" style="
        background: transparent; border: 1px solid #2a2a2a; color: #9e9e9e;
        padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.2s;
      ">Cancel</button>
      <button class="btn-submit" style="
        background: var(--orange); border: none; color: black;
        padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s;
      ">Submit</button>
    </div>
  `;

  const closeModal = () => {
    overlay.style.animation = 'fadeOut 0.2s ease-in';
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  modal.querySelector('.btn-cancel').onclick = closeModal;
  
  modal.querySelector('.btn-submit').onclick = () => {
    const rating = parseInt(document.getElementById('review-rating').value, 10);
    const review = document.getElementById('review-text').value.trim();
    
    if (rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }
    
    const submitBtn = modal.querySelector('.btn-submit');
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    fetch('http://localhost:5000/add-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, rating: rating, review: review })
    })
    .then(res => res.json())
    .then(data => {
      if(data.status === 'success') {
        showToast('Review submitted successfully!', 'success');
        closeModal();
        loadBookings();
      } else {
        alert('Error: ' + data.message);
        submitBtn.textContent = 'Submit';
        submitBtn.disabled = false;
      }
    })
    .catch(err => {
      console.error(err);
      alert('Failed to submit review');
      submitBtn.textContent = 'Submit';
      submitBtn.disabled = false;
    });
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}