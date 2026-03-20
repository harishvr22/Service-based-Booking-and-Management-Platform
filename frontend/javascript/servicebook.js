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
    alert("Please enter apartment ID");
    return;
  }
  if (!contactNumber) {
    alert("Please enter contact number");
    return;
  }
  if (!selectedDate) {
    alert("Please select a date");
    return;
  }
  if (!selectedTime) {
    alert("Please select a time");
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
      const service = services.find(s => s.name === serviceName);
      if (!service) {
        alert("Service not found");
        return;
      }

      // Assume resident_id is 1 for now (should get from login response or localStorage)
      const residentId = 1; // TODO: get actual resident id

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
          alert("Service booked successfully!");
          window.location.href = "mybookings.html";
        } else {
          alert("Booking failed. Please try again.");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("Booking failed. Please try again.");
      });
    })
    .catch(error => {
      console.error('Error fetching services:', error);
      alert("Failed to load services. Please try again.");
    });
});