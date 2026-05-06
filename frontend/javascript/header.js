document.addEventListener('DOMContentLoaded', () => {
  const nameEls = document.querySelectorAll('.user-name');
  const logoutBtns = document.querySelectorAll('.logout-btn');
  const avatars = document.querySelectorAll('.avatar');

  const providerPages = ['ProviderDashboard', 'ServiceRequests', 'JobHistory', 'ProviderProfile', 'provider_notifications'];
  const isProviderPage = providerPages.some(p => window.location.href.includes(p)) || document.title.includes('Provider');
  
  const userName = sessionStorage.getItem('userName');
  const providerName = sessionStorage.getItem('providerName');
  
  // Use providerName if available, else fallback to userName, then defaults
  const displayName = isProviderPage ? (providerName || userName || 'Provider') : (userName || 'Guest');

  // Update text names
  const updateUI = (name) => {
    nameEls.forEach(el => {
      if (el.classList.contains('welcome')) {
        el.textContent = `Welcome, ${name}`;
      } else {
        el.textContent = name;
      }
    });

    const dashWelcome = document.getElementById('providerName');
    if (dashWelcome) dashWelcome.textContent = 'Hi, ' + name + '.';

    const dashRole = document.getElementById('providerRole');
    if (dashRole) {
      const savedRole = sessionStorage.getItem('providerRole') || 'Provider';
      dashRole.innerHTML = `<i class="fas fa-tools"></i> ${savedRole}`;
    }

    avatars.forEach(avatar => {
      const names = name.split(' ');
      const initials = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
      avatar.textContent = initials;
    });
  };

  updateUI(displayName);

  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.clear();
      window.location.href = 'landingpage.html';
    });
  });
});