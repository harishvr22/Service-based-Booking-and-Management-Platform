document.addEventListener('DOMContentLoaded', () => {
  const nameEls = document.querySelectorAll('.user-name');
  const logoutBtns = document.querySelectorAll('.logout-btn');

  const userName = localStorage.getItem('userName');
  const displayName = userName ? userName : 'Guest';

  nameEls.forEach(el => {
    // If element has class 'welcome' show "Welcome, Name"
    if (el.classList.contains('welcome')) {
      el.textContent = `Welcome, ${displayName}`;
    } else {
      el.textContent = displayName;
    }
  });

  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('isLoggedIn');
      // optional: remove userName to fully clear
      // localStorage.removeItem('userName');
      window.location.href = 'login.html';
    });
  });
});