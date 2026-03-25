document.addEventListener('DOMContentLoaded', () => {
  // Fetch services from backend
  fetch('http://localhost:5000/services')
    .then(response => response.json())
    .then(services => {
      const servicesGrid = document.querySelector('.services-grid');
      if (servicesGrid) {
        servicesGrid.innerHTML = ''; // Clear existing hardcoded services
        services.forEach(service => {
          const serviceName = service.service_name || service.name || 'Unknown Service';
          const serviceCard = document.createElement('a');
          serviceCard.href = `servicebooking.html?service=${encodeURIComponent(serviceName)}`;
          serviceCard.className = 'service-card';
          serviceCard.innerHTML = `
            <div class="icon">${getServiceIcon(serviceName)}</div>
            <h3>${serviceName}</h3>
            <p>${service.description || 'Professional service'}</p>
          `;
          servicesGrid.appendChild(serviceCard);
        });
      }
    })
    .catch(error => {
      console.error('Error fetching services:', error);
    });
});

function getServiceIcon(serviceName) {
  const icons = {
    'Plumber': '🔧',
    'Electrician': '⚡',
    'Carpenter': '🪚',
    'Painter': '🎨',
    'Cleaner': '✨',
    'HVAC': '🌬️',
    'Locksmith': '🔑',
    'Pest Control': '🐞'
  };
  return icons[serviceName] || '🛠️';
}