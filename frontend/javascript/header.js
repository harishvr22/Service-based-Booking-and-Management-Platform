document.addEventListener('DOMContentLoaded', () => {
  const nameEls = document.querySelectorAll('.user-name');
  const logoutBtns = document.querySelectorAll('.logout-btn');
  const avatars = document.querySelectorAll('.avatar');

  const isProviderPage = window.location.href.includes('Provider') || document.title.includes('Provider');
  const userName = localStorage.getItem('userName');
  const providerName = localStorage.getItem('providerName');
  const displayName = isProviderPage ? (providerName || 'Provider') : (userName || 'Guest');

  // Update text names
  nameEls.forEach(el => {
    // If element has class 'welcome' show "Welcome, Name"
    if (el.classList.contains('welcome')) {
      el.textContent = `Welcome, ${displayName}`;
    } else {
      el.textContent = displayName;
    }
  });

  // Update avatar initials
  avatars.forEach(avatar => {
    const names = displayName.split(' ');
    const initials = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    avatar.textContent = initials;
  });

  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      window.location.href = 'landingpage.html';
    });
  });

  // Listen for storage changes to update avatar/name in real-time across tabs
  window.addEventListener('storage', (e) => {
    const isProviderPage = window.location.href.includes('Provider') || document.title.includes('Provider');
    
    if (e.key === 'userName' && !isProviderPage) {
      const newName = e.newValue || 'Guest';
      // Update text names
      nameEls.forEach(el => {
        if (el.classList.contains('welcome')) {
          el.textContent = `Welcome, ${newName}`;
        } else {
          el.textContent = newName;
        }
      });
      // Update avatar initials only on resident pages
      avatars.forEach(avatar => {
        const names = newName.split(' ');
        const initials = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatar.textContent = initials;
      });
    }
    if (e.key === 'providerName' && isProviderPage) {
      const newName = e.newValue || 'Provider';
      // Update avatar initials only on provider pages
      avatars.forEach(avatar => {
        const names = newName.split(' ');
        const initials = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatar.textContent = initials;
      });
    }
  });
});