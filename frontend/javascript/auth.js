// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    console.log("Login:", email, password);

    // Connect to Flask API
    fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Login response:', data);
        if (data.status === 'success') {
          sessionStorage.setItem('userEmail', email);
          const role = data.user && data.user.role ? String(data.user.role).trim() : 'admin';
          sessionStorage.setItem('userRole', role);
          sessionStorage.setItem('isLoggedIn', 'true');
          // Store the actual name from backend response
          sessionStorage.setItem('userName', data.user.name);
          sessionStorage.setItem('userId', data.user.id);
          sessionStorage.setItem('userPhone', data.user.phone || '');
          sessionStorage.setItem('userApartment', data.user.apartment_id || '');
          sessionStorage.setItem('userAvailability', data.user.availability || '');
          sessionStorage.setItem('userSkills', data.user.skills || '');
          sessionStorage.setItem('userBio', data.user.bio || '');
          showConfirmDialog("Login Successful", "Login successful! You will be redirected to your dashboard.", () => {
            const normalizedRole = role.toLowerCase();
            console.log('Normalized role:', normalizedRole);
            if (normalizedRole.includes('resident')) {
              window.location.href = "ResidentDashboard.html";
            } else if (normalizedRole.includes('provider')) {
              window.location.href = "ProviderDashboard.html";
            } else if (normalizedRole.includes('admin')) {
              window.location.href = "admin_dashboard.html";
            } else {
              window.location.href = "admin_dashboard.html";
            }
          }, "Continue", "OK");
        } else {
          console.error('Login failed:', data);
          showConfirmDialog("Login Failed", "Invalid credentials. Please check your email and password.", () => { }, "OK", "OK");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showConfirmDialog("Login Failed", "Login failed. Please check if the server is running.", () => { }, "OK", "OK");
      });
  });
}

// SIGNUP MULTI-STEP LOGIC
let currentStep = 1;
let step1Data = {};

function nextStep() {
  if (validateStep(currentStep)) {
    if (currentStep === 1) {
      // Store step 1 data before moving to step 2
      step1Data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.querySelector('input[name="role"]:checked').value
      };

      const role = step1Data.role;
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
      showConfirmDialog("Validation Error", "Please fill in all account details.", () => { }, "OK", "OK");
      return false;
    }
  }
  return true;
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Use stored step 1 data
    const data = {
      name: step1Data.name,
      email: step1Data.email,
      password: step1Data.password,
      role: step1Data.role,
      apartment_id: "A-101"  // Default apartment
    };

    if (step1Data.role === 'Resident') {
      data.phone = document.getElementById("phone").value;
      const flat = document.getElementById("flatNumber")?.value || "";
      const block = document.getElementById("block")?.value || "";
      data.apartment_id = block ? `${block}|${flat}` : flat || "A-101";
      const moveInDate = document.getElementById("moveInDate")?.value || "";
      data.availability = moveInDate; // Store moveInDate in availability field
    } else {
      data.phone = document.getElementById("providerPhone").value;
      const serviceCategory = document.getElementById("serviceCategory")?.value || '';
      
      // Map category to Role
      const roleMap = {
        'Plumbing': 'Provider: Plumber',
        'Electrical': 'Provider: Electrician',
        'Cleaning': 'Provider: Cleaner',
        'Carpentry': 'Provider: Carpenter',
        'HVAC': 'Provider: HVAC Technician'
      };
      data.role = roleMap[serviceCategory] || 'Provider';
      
      const specialization = document.getElementById("specialization")?.value || '';
      data.skills = specialization || 'General Service';

      const experience = document.getElementById("experience")?.value || '';
      const serviceArea = document.getElementById("serviceArea")?.value || '';
      
      // Combine experience and area into Bio
      let bioParts = [];
      if (experience) bioParts.push(`Experience: ${experience}`);
      if (serviceArea) bioParts.push(`Service Area: ${serviceArea} Wing`);
      data.bio = bioParts.join(' | ') || 'Certified Service Provider';

      // Default availability time (Standard practice)
      data.availability = 'Mon-Sat • 9 AM - 7 PM';
    }

    console.log("step1Data:", step1Data);
    console.log("Signup Complete:", data);

    // Validate required fields
    if (!step1Data.name || !step1Data.email || !step1Data.password) {
      showConfirmDialog("Validation Error", "Please complete step 1 first.", () => { }, "OK", "OK");
      return;
    }

    if (!data.name || !data.email || !data.password) {
      showConfirmDialog("Validation Error", "Missing required fields.", () => { }, "OK", "OK");
      return;
    }

    // Connect to Flask API
    console.log('Sending data to backend:', JSON.stringify(data, null, 2));

    fetch('http://127.0.0.1:5000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(result => {
        if (result.status === 'success') {
          showConfirmDialog("Signup Successful", "Signup successful! You will be redirected to the login page.", () => {
            window.location.href = "login.html";
          }, "Continue", "OK");
        } else {
          showConfirmDialog("Signup Failed", "Signup failed. Please try again.", () => { }, "OK", "OK");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        console.error('Error response:', error.response);
        if (error.response) {
          error.response.json().then(errData => {
            console.error('Error data:', errData);
            showConfirmDialog("Signup Failed", errData.message || "Signup failed. Please try again.", () => { }, "OK", "OK");
          });
        } else {
          showConfirmDialog("Signup Failed", "Network error. Please check your connection.", () => { }, "OK", "OK");
        }
      });
  });
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
function showConfirmDialog(title, message, onConfirm, confirmText = 'OK', cancelText = 'Cancel', confirmColor = 'var(--primary-color, #ff8c00)') {
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
        background: var(--surface, #0f0f0f);
        border: 1px solid var(--border, #2a2a2a);
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease-out;
    `;

  // Only show cancel button if it's different from confirmText
  const showCancel = cancelText && cancelText !== confirmText;

  modal.innerHTML = `
        <h3 style="color: var(--text-color, #f4f4f4); margin: 0 0 12px; font-size: 18px; font-weight: 600;">${title}</h3>
        <p style="color: var(--text-light, #c6c6c6); margin: 0 0 24px; line-height: 1.5;">${message}</p>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            ${showCancel ? `<button class="btn-cancel" style="
                background: transparent;
                border: 1px solid var(--border, #2a2a2a);
                color: var(--text-light, #c6c6c6);
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            ">${cancelText}</button>` : ''}
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

  if (cancelBtn) {
    cancelBtn.onmouseover = () => { cancelBtn.style.background = 'rgba(255,255,255,0.05)'; };
    cancelBtn.onmouseout = () => { cancelBtn.style.background = 'transparent'; };
    cancelBtn.onclick = () => closeModal();
  }

  confirmBtn.onmouseover = () => { confirmBtn.style.filter = 'brightness(1.1)'; };
  confirmBtn.onmouseout = () => { confirmBtn.style.filter = 'none'; };
  confirmBtn.onclick = () => {
    closeModal();
    if (onConfirm) onConfirm();
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
