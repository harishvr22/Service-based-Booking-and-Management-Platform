lucide.createIcons();

// Display selected service on page load
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const service = urlParams.get('service') || 'General Service';
  const selectedServiceDiv = document.getElementById('selectedService');
  
  if (selectedServiceDiv) {
    selectedServiceDiv.textContent = service;
  }
});

// Time selector
document.querySelectorAll(".time").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".time").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Calendar functionality
let currentDate = new Date(2026, 1, 7); // February 7, 2026

function generateCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Update month display
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  document.querySelector(".cal-header span").textContent = monthNames[month] + " " + year;
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Clear dates
  const datesDiv = document.querySelector(".dates");
  datesDiv.innerHTML = "";
  
  // Add empty spaces for days before month starts
  for (let i = 0; i < firstDay; i++) {
    datesDiv.innerHTML += "<span></span>";
  }
  
  // Add days
  for (let day = 1; day <= daysInMonth; day++) {
    const span = document.createElement("span");
    span.textContent = day;
    
    // Highlight today (Feb 7)
    if (month === 1 && day === 7 && year === 2026) {
      span.classList.add("selected");
    }
    
    span.addEventListener("click", () => {
      document.querySelectorAll(".dates span").forEach(s => s.classList.remove("selected"));
      span.classList.add("selected");
    });
    
    datesDiv.appendChild(span);
  }
}

// Calendar navigation
document.querySelectorAll(".cal-header button").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    if (index === 0) {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    generateCalendar();
  });
});

generateCalendar();
// Submit Booking
document.querySelector(".submit").addEventListener("click", () => {
  const apartmentId = document.querySelector('input[placeholder="Enter your apartment ID"]').value.trim();
  const contactNumber = document.querySelector('input[placeholder="Enter your contact number"]').value.trim();
  const selectedDate = document.querySelector(".dates .selected");
  const selectedTime = document.querySelector(".time.active");
  const problemSummary = document.querySelector('textarea').value.trim();

  // Validate form
  if (!apartmentId) {
    showConfirmDialog("Validation Error", "Please enter apartment ID", () => {}, "OK", "OK", "#e74c3c");
    return;
  }
  if (!contactNumber) {
    showConfirmDialog("Validation Error", "Please enter contact number", () => {}, "OK", "OK", "#e74c3c");
    return;
  }
  if (!selectedDate) {
    showConfirmDialog("Validation Error", "Please select a date", () => {}, "OK", "OK", "#e74c3c");
    return;
  }
  if (!selectedTime) {
    showConfirmDialog("Validation Error", "Please select a time", () => {}, "OK", "OK", "#e74c3c");
    return;
  }

  // Get the month and year from calendar header
  const monthYearText = document.querySelector(".cal-header span").textContent;
  const timeText = selectedTime.textContent;
  const dateText = `${selectedDate.textContent} ${monthYearText}`;

  // Get service from query param or default
  const urlParams = new URLSearchParams(window.location.search);
  const serviceName = urlParams.get('service') || 'General Service';

  // Fetch services to get service_id
  fetch('http://localhost:5000/services')
    .then(response => response.json())
    .then(services => {
      const service = services.find(s => (s.service_name || s.name) === serviceName);
      if (!service) {
        showConfirmDialog("Error", "Service not found", () => {}, "OK", "OK", "#e74c3c");
        return;
      }

      // Get actual resident id from localStorage
      const residentId = localStorage.getItem('userId') || '1';

      // Post to backend
      fetch('http://localhost:5000/book-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resident_id: residentId,
          service_id: service.id
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'booking_created') {
          showConfirmDialog("Success!", "Service booked successfully! You will be redirected to your bookings.", () => {
            window.location.href = "mybookings.html";
          }, "View Bookings", "Cancel", "#2ecc71");
        } else {
          showConfirmDialog("Booking Failed", "Booking failed. Please try again.", () => {}, "OK", "OK", "#e74c3c");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showConfirmDialog("Booking Failed", "Booking failed. Please try again.", () => {}, "OK", "OK", "#e74c3c");
      });
    })
    .catch(error => {
      console.error('Error fetching services:', error);
      showConfirmDialog("Error", "Failed to load services. Please try again.", () => {}, "OK", "OK", "#e74c3c");
    });
});
function goBack(event) {
        event.preventDefault();
        window.history.back();
      }

function showNotification(message, type = 'info', duration = 3000) {
    // Remove any existing notifications
    const existing = document.querySelector('.notification-popup');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-popup notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;

    // Add CSS animation
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-popup {
                font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .notification-content i {
                font-size: 18px;
                flex-shrink: 0;
            }
            .notification-content span {
                flex: 1;
                font-weight: 500;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 2px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            .notification-close:hover {
                background: rgba(255,255,255,0.2);
            }
        `;
        document.head.appendChild(style);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Themed confirm dialog
function showConfirmDialog(title, message, onConfirm, confirmText = 'OK', cancelText = 'Cancel', confirmColor = '#e74c3c') {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
    `;

    // Create modal box
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--bg-card, #1c1c1c);
        border: 1px solid var(--border-color, #2a2a2a);
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
    `;

    modal.innerHTML = `
        <h3 style="color: var(--text-main, #fff); margin: 0 0 12px; font-size: 18px; font-weight: 600;">${title}</h3>
        <p style="color: var(--text-muted, #9e9e9e); margin: 0 0 24px; line-height: 1.5;">${message}</p>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn-cancel" style="
                background: transparent;
                border: 1px solid var(--border-color, #2a2a2a);
                color: var(--text-muted, #9e9e9e);
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            ">${cancelText}</button>
            <button class="btn-confirm" style="
                background: ${confirmColor};
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            ">${confirmText}</button>
        </div>
    `;

    // Add hover effects
    const cancelBtn = modal.querySelector('.btn-cancel');
    const confirmBtn = modal.querySelector('.btn-confirm');
    cancelBtn.onmouseover = () => { cancelBtn.style.background = 'rgba(255,255,255,0.05)'; };
    cancelBtn.onmouseout = () => { cancelBtn.style.background = 'transparent'; };
    confirmBtn.onmouseover = () => { confirmBtn.style.background = confirmColor === '#e74c3c' ? '#c0392b' : confirmColor === '#2ecc71' ? '#27ae60' : '#2980b9'; };
    confirmBtn.onmouseout = () => { confirmBtn.style.background = confirmColor; };

    // Event handlers
    cancelBtn.onclick = () => closeModal();
    confirmBtn.onclick = () => {
        closeModal();
        onConfirm();
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };

    function closeModal() {
        overlay.style.animation = 'fadeOut 0.2s ease-in';
        modal.style.animation = 'slideDown 0.2s ease-in';
        setTimeout(() => overlay.remove(), 200);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(20px); opacity: 0; }
    }
`;
document.head.appendChild(style);
