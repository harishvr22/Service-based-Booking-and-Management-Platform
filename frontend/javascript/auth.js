// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    console.log("Login:", email, password);

    // Demo: set user name if stored, otherwise derive from email
    let storedName = localStorage.getItem('userName');
    if (!storedName) {
      storedName = email ? email.split('@')[0] : 'User';
      localStorage.setItem('userName', storedName);
    }
    localStorage.setItem('userEmail', email);
    // Default role is Resident for demo, can be updated with API
    if (!localStorage.getItem('userRole')) {
      localStorage.setItem('userRole', 'Resident');
    }
    localStorage.setItem('isLoggedIn', 'true');

    // Later: connect Flask API
    alert("Login successful (demo)");
    window.location.href = "ResidentDashboard.html";
  });
}

// SIGNUP
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      role: document.querySelector('input[name="role"]:checked') ? document.querySelector('input[name="role"]:checked').value : 'Resident'
    };

    console.log("Signup:", data);

    // Demo: store user info locally so header can show name
    if (data.name) localStorage.setItem('userName', data.name);
    if (data.email) localStorage.setItem('userEmail', data.email);
    if (data.role) localStorage.setItem('userRole', data.role);
    localStorage.setItem('isLoggedIn', 'true');

    // Later: connect Flask API
    alert("Signup successful (demo)");
    window.location.href = "login.html";
  });
}

// Toggle password visibility for inputs with an eye icon
function togglePass(id, el) {
  const input = document.getElementById(id);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    el.classList.remove('fa-regular', 'fa-eye');
    el.classList.add('fa-solid', 'fa-eye-slash');
  } else {
    input.type = 'password';
    el.classList.remove('fa-solid', 'fa-eye-slash');
    el.classList.add('fa-regular', 'fa-eye');
  }
}

// Toggle between Apartment ID and Service Type based on role
const roleRadios = document.querySelectorAll('input[name="role"]');
const apartmentField = document.getElementById('apartmentField');
const apartmentLabel = document.getElementById('apartmentLabel');
const serviceDropdownWrapper = document.getElementById('serviceDropdownWrapper');
const serviceLabel = document.getElementById('serviceLabel');

if (roleRadios.length) {
  roleRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'Provider') {
        // Show Service Type, hide Apartment ID
        if (apartmentField) apartmentField.style.display = 'none';
        if (apartmentLabel) apartmentLabel.style.display = 'none';
        if (serviceDropdownWrapper) serviceDropdownWrapper.style.display = 'block';
        if (serviceLabel) serviceLabel.style.display = 'block';
      } else {
        // Show Apartment ID, hide Service Type
        if (apartmentField) apartmentField.style.display = 'block';
        if (apartmentLabel) apartmentLabel.style.display = 'block';
        if (serviceDropdownWrapper) serviceDropdownWrapper.style.display = 'none';
        if (serviceLabel) serviceLabel.style.display = 'none';
      }
    });
  });
}

// Custom Dropdown Handler
const customDropdown = document.getElementById('customDropdown');
const dropdownSelected = document.getElementById('dropdownSelected');
const dropdownMenu = document.getElementById('dropdownMenu');
const serviceValue = document.getElementById('serviceValue');
const menuItems = document.querySelectorAll('.dropdown-menu li');

if (customDropdown) {
  // Toggle dropdown open/close
  dropdownSelected.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
    dropdownSelected.classList.toggle('active');
  });

  // Handle menu item selection
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const value = item.getAttribute('data-value');
      const text = item.textContent;

      // Update selected value
      if (serviceValue) serviceValue.value = value;
      if (dropdownSelected) dropdownSelected.querySelector('span').textContent = text;

      // Update UI
      menuItems.forEach(li => li.classList.remove('selected'));
      item.classList.add('selected');

      // Close dropdown
      dropdownMenu.classList.remove('show');
      dropdownSelected.classList.remove('active');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!customDropdown.contains(e.target)) {
      dropdownMenu.classList.remove('show');
      dropdownSelected.classList.remove('active');
    }
  });
}
