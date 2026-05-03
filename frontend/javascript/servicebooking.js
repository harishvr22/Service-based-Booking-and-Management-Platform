// Service Booking JavaScript

// Service data
const services = {
  electrical: {
    id: 2,
    name: 'Electrical Repair',
    description: 'Expert electrical services including wiring, fixture installation, circuit repairs, and safety inspections by licensed electricians.',
    price: '$60-150',
    image: '../assets/electrical.png'
  },
  plumbing: {
    id: 1,
    name: 'Plumbing',
    description: 'Professional plumbing services for pipe repairs, installations, leak detection, drain cleaning, and emergency plumbing issues.',
    price: '$50-120',
    image: '../assets/plumber.png'
  },
  cleaning: {
    id: 5,
    name: 'Deep Cleaning',
    description: 'Thorough cleaning services including deep house cleaning, carpet cleaning, window washing, and post-renovation cleanup.',
    price: '$40-80',
    image: '../assets/cleaning.png'
  },
  ac: {
    id: 6,
    name: 'AC Service',
    description: 'Complete air conditioning services including installation, repair, maintenance, and cleaning for all AC types and brands.',
    price: '$70-200',
    image: '../assets/ac service.png'
  },
  carpentry: {
    id: 3,
    name: 'Carpentry',
    description: 'Custom carpentry services including furniture repair, installation, woodwork, cabinets, and custom-built solutions.',
    price: '$45-150',
    image: '../assets/carpentering.png'
  },
  painting: {
    id: 4,
    name: 'Painting',
    description: 'Professional painting services for interior and exterior walls, furniture, and decorative painting with quality materials.',
    price: '$55-180',
    image: '../assets/painting.png'
  }
};

// Current selected service
let currentService = null;

// Book service function - opens modal
function bookService(serviceType) {
  const service = services[serviceType];
  if (!service) return;
  
  currentService = {
    type: serviceType,
    ...service
  };
  
  // Update modal content
  updateModalContent(service);
  
  // Show modal
  showBookingModal();
}

// Update modal content with service info
function updateModalContent(service) {
  document.getElementById('modalTitle').textContent = `Book ${service.name}`;
  document.getElementById('modalServiceImage').src = service.image;
  document.getElementById('modalServiceName').textContent = service.name;
  document.getElementById('modalServiceDesc').textContent = service.description;
}

// Show booking modal
function showBookingModal() {
  const modal = document.getElementById('bookingModal');
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// Close booking modal
function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
    // Reset form
    resetBookingForm();
  }, 300);
}

// Reset booking form
function resetBookingForm() {
  const form = document.getElementById('bookingForm');
  form.reset();
  currentService = null;
}

// Confirm booking
function confirmBooking() {
  try {
    // Get form values
    const apartmentId = document.getElementById('apartmentId').value.trim();
    const mobileNumber = document.getElementById('mobileNumber').value.trim();
    const problemDescription = document.getElementById('problemDescription').value.trim();
    const timeDuration = document.getElementById('timeDuration').value;
    const preferredDate = document.getElementById('preferredDate').value;
    const preferredTime = document.getElementById('preferredTime').value;
    const additionalNotes = document.getElementById('additionalNotes').value.trim();

    // Validate required fields
    if (!apartmentId) {
      showNotification('Please enter your apartment ID', 'error');
      document.getElementById('apartmentId').focus();
      return;
    }

    if (!mobileNumber) {
      showNotification('Please enter your mobile number', 'error');
      document.getElementById('mobileNumber').focus();
      return;
    }

    if (!problemDescription) {
      showNotification('Please describe the problem', 'error');
      document.getElementById('problemDescription').focus();
      return;
    }

    if (!timeDuration) {
      showNotification('Please select available time duration', 'error');
      document.getElementById('timeDuration').focus();
      return;
    }

    if (!preferredDate) {
      showNotification('Please select preferred date', 'error');
      document.getElementById('preferredDate').focus();
      return;
    }

    if (!preferredTime) {
      showNotification('Please select preferred time', 'error');
      document.getElementById('preferredTime').focus();
      return;
    }

    // Validate mobile number (accept 10 digits with optional spaces/dashes)
    const cleanMobileNumber = mobileNumber.replace(/[\s-]/g, '');
    if (!/^\d{10}$/.test(cleanMobileNumber)) {
      showNotification('Please enter a valid 10-digit mobile number', 'error');
      document.getElementById('mobileNumber').focus();
      return;
    }

    // Validate apartment ID format (basic validation)
    if (apartmentId.length < 3) {
      showNotification('Please enter a valid apartment ID', 'error');
      document.getElementById('apartmentId').focus();
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showNotification('Please select a future date', 'error');
      document.getElementById('preferredDate').focus();
      return;
    }

    // Create booking data
    const bookingData = {
      id: 'BK' + Date.now(), // Generate unique booking ID
      service: currentService,
      apartmentId: apartmentId.toUpperCase(),
      mobileNumber: cleanMobileNumber,
      problemDescription,
      timeDuration,
      preferredDate,
      preferredTime,
      additionalNotes,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    // Send booking to backend
    const userId = localStorage.getItem('userId') || '1';
    const payload = {
      resident_id: userId,
      service_id: currentService.id,
      apartment_id: apartmentId.toUpperCase(),
      mobile_number: cleanMobileNumber,
      problem_description: problemDescription,
      time_duration: timeDuration,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      additional_notes: additionalNotes
    };

    fetch('http://localhost:5000/book-service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Booking confirmed:', data);
      
      // Also store in localStorage as backup
      let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push({...bookingData, ...data});
      localStorage.setItem('bookings', JSON.stringify(bookings));
      
      // Trigger refresh of bookings page if it's open
      if (window.location.pathname.includes('mybookings.html')) {
        // Reload the page to show new booking
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    })
    .catch(error => {
      console.error('Error submitting booking:', error);
      // Fallback to localStorage only
      let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push(bookingData);
      localStorage.setItem('bookings', JSON.stringify(bookings));
      
      // Trigger refresh of bookings page if it's open
      if (window.location.pathname.includes('mybookings.html')) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
    
    // Show success message
    const successMessage = `Booking confirmed for ${currentService.name}!<br><br>
      <strong>Booking ID:</strong> ${bookingData.id}<br>
      <strong>Date:</strong> ${preferredDate}<br>
      <strong>Time:</strong> ${preferredTime}<br>
      <strong>Apartment:</strong> ${apartmentId}<br>
      <strong>Contact:</strong> ${mobileNumber}<br><br>
      We'll contact you soon to confirm your booking.<br><br>
      <a href="mybookings.html" style="color: var(--orange); text-decoration: none; font-weight: 600;">View My Bookings →</a>`;
    
    showNotification(successMessage, 'success', 8000);
    
    // Close modal
    closeBookingModal();
    
    // Optional: Redirect to bookings page
    // setTimeout(() => {
    //   window.location.href = 'mybookings.html';
    // }, 2000);
    
  } catch (error) {
    console.error('Booking error:', error);
    showNotification('An error occurred while processing your booking. Please try again.', 'error');
  }
}

// Custom notification system
function showNotification(message, type = 'info', duration = 3000) {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span class="notification-close" onclick="this.parentElement.remove()">&times;</span>
    ${message}
  `;

  // Add to page
  document.body.appendChild(notification);

  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Service booking page loaded');
  
  // Add hover effects to service cards
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Add click handlers to book now buttons
  const bookButtons = document.querySelectorAll('.book-now-btn');
  bookButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const serviceType = this.getAttribute('onclick').match(/bookService\('(.+?)'\)/)[1];
      bookService(serviceType);
    });
  });

  // Close modal when clicking outside
  const modalOverlay = document.getElementById('bookingModal');
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
      closeBookingModal();
    }
  });

  // Set minimum date to today
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
});

// Mobile menu toggle (if needed)
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('open');
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    window.location.href = 'landingpage.html';
  }
}
