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

// SIGNUP MULTI-STEP LOGIC
let currentStep = 1;

function nextStep() {
  if (validateStep(currentStep)) {
    if (currentStep === 1) {
      const role = document.querySelector('input[name="role"]:checked').value;
      const resFields = document.getElementById('residentFields');
      const provFields = document.getElementById('providerFields');
      const s2Title = document.getElementById('step2Title');
      const s2Subtitle = document.getElementById('step2Subtitle');

      if (role === 'Provider') {
        resFields.style.display = 'none';
        provFields.style.display = 'block';
        s2Title.textContent = "Complete your profile";
        s2Subtitle.textContent = "Tell us about your service expertise";
      } else {
        resFields.style.display = 'block';
        provFields.style.display = 'none';
        s2Title.textContent = "Complete your profile";
        s2Subtitle.textContent = "Tell us about your apartment details";
      }
    }
    currentStep++;
    updateStepUI();
  }
}

function prevStep() {
  currentStep--;
  updateStepUI();
}

function updateStepUI() {
  // Update form steps
  document.querySelectorAll('.form-step').forEach((step, index) => {
    step.classList.toggle('active', index + 1 === currentStep);
  });

  // Update progress indicators
  const step1 = document.getElementById('stepIndicator1');
  const step2 = document.getElementById('stepIndicator2');
  const line = document.querySelector('.progress-stepper .line');

  if (currentStep === 1) {
    step1.classList.add('active');
    step1.classList.remove('completed');
    step1.querySelector('.circle').innerHTML = '1';
    step2.classList.remove('active');
    line.classList.remove('active');
  } else {
    step1.classList.add('completed');
    step1.querySelector('.circle').innerHTML = '<i class="fa-solid fa-check"></i>';
    step2.classList.add('active');
    line.classList.add('active');
  }
}

function validateStep(step) {
  if (step === 1) {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!name || !email || !password) {
      alert("Please fill in all account details.");
      return false;
    }
  }
  return true;
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const role = document.querySelector('input[name="role"]:checked').value;
    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      role: role
    };

    if (role === 'Resident') {
      data.phone = document.getElementById("phone").value;
      data.flatNumber = document.getElementById("flatNumber").value;
      data.block = document.getElementById("block").value;
      data.moveInDate = document.getElementById("moveInDate").value;
    } else {
      data.phone = document.getElementById("providerPhone").value;
      data.serviceCategory = document.getElementById("serviceCategory").value;
      data.specialization = document.getElementById("specialization").value;
      data.serviceArea = document.getElementById("serviceArea").value;
      data.experience = document.getElementById("experience").value;
    }

    console.log("Signup Complete:", data);

    // Demo: store user info locally
    localStorage.setItem('userName', data.name);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('isLoggedIn', 'true');

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
