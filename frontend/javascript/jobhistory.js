document.addEventListener('DOMContentLoaded', async () => {
  const jobsList = document.getElementById('jobsList');
  if (!jobsList) return;

  try {
    const [bookingsResponse, servicesResponse] = await Promise.all([
      fetch('http://localhost:5000/bookings'),
      fetch('http://localhost:5000/services')
    ]);

    const bookings = await bookingsResponse.json();
    const services = await servicesResponse.json();

    const serviceMap = {};
    services.forEach(service => {
      serviceMap[service.id] = service.service_name || service.name || 'Unknown Service';
    });

    const completedJobs = bookings.filter((booking) => booking.status === 'completed');

    if (completedJobs.length === 0) {
      jobsList.innerHTML = '<div class="job-card"><p>No completed jobs found.</p></div>';
      return;
    }

    jobsList.innerHTML = completedJobs.map((booking) => {
      const serviceTitle = serviceMap[booking.service_id] || 'Unknown Service';
      const dateText = booking.updated_at || booking.created_at || 'Unknown Date';
      const timeText = booking.time || 'N/A';
      const residentText = booking.resident_id ? `Resident #${booking.resident_id}` : 'Resident N/A';

      return `
        <div class="job-card">
          <div class="job-header">
            <div class="job-info">
              <h3>${serviceTitle}</h3>
              <p class="resident-info">${residentText}</p>
            </div>
            <span class="status-badge completed">Completed</span>
          </div>
          <div class="job-details">
            <div class="detail-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>${dateText}</span>
            </div>
            <div class="detail-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>${timeText}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to load job history', error);
    jobsList.innerHTML = '<div class="job-card"><p>Could not load completed jobs. Try again later.</p></div>';
  }
});