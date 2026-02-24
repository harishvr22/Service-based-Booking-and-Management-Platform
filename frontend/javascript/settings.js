document.addEventListener('DOMContentLoaded', function () {
    // 1. Handle Save Buttons
    const saveButtons = document.querySelectorAll('.btn-save');
    saveButtons.forEach(button => {
        button.addEventListener('click', function () {
            const originalText = this.innerText;
            const section = this.closest('.settings-card').querySelector('h3').innerText;

            // Simple visual feedback on button
            this.innerText = 'Saving...';
            this.disabled = true;

            // Mock API call
            setTimeout(() => {
                this.innerText = originalText;
                this.disabled = false;
                showToast(`Success: ${section} updated!`, 'success');
            }, 1000);
        });
    });

    // 2. Handle Toggle Switches
    const switches = document.querySelectorAll('.switch input');
    switches.forEach(sw => {
        sw.addEventListener('change', function () {
            const label = this.closest('.toggle-item').querySelector('h4').innerText;
            const status = this.checked ? 'Enabled' : 'Disabled';
            showToast(`${label}: ${status}`, 'info');
        });
    });

    // 3. Toast Notification Logic
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';

        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
});
