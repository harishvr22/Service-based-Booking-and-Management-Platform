/**
 * Provider Profile – Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.querySelector('.btn-save-changes');
    const nameInput = document.querySelector('input[type="text"]');
    const profileNameEl = document.querySelector('.profile-left-panel h2');
    const avatarEl = document.querySelector('.profile-avatar-large');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const btn = saveBtn;
            const originalText = btn.textContent;
            
            // Visual feedback on save
            btn.textContent = 'Saving...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            // Get new name (first text input is the name field)
            const newName = nameInput ? nameInput.value.trim() : 'Provider';
            
            // Save to localStorage
            localStorage.setItem('providerName', newName);

            // Update UI
            if (profileNameEl) profileNameEl.textContent = newName;
            
            // Update avatar initials
            if (avatarEl) {
                const names = newName.split(' ');
                const initials = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
                avatarEl.textContent = initials;
            }

            // Trigger avatar update across all pages
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'providerName',
                newValue: newName
            }));

            setTimeout(() => {
                btn.textContent = 'Saved!';
                btn.style.background = '#2ecc71';
                btn.style.color = '#000';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = 'var(--orange)';
                    btn.style.opacity = '1';
                    btn.disabled = false;
                }, 2000);
            }, 800);
        });
    }

    // Load from localStorage on page load
    const savedName = localStorage.getItem('providerName');
    if (savedName) {
        if (nameInput) nameInput.value = savedName;
        if (profileNameEl) profileNameEl.textContent = savedName;
        if (avatarEl) {
            const names = savedName.split(' ');
            const initials = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
            avatarEl.textContent = initials;
        }
    }
});

// Helper toast function
function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log(`Toast [${type}]: ${message}`);
    }
}
