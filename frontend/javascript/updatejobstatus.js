/**
 * Update Job Status Page JavaScript
 */

// Handle status dropdown change
document.querySelectorAll('.status-dropdown').forEach((dropdown) => {
    dropdown.addEventListener('change', function() {
        const jobCard = this.closest('.job-card');
        const statusBadge = jobCard.querySelector('.status-badge');
        const selectedValue = this.value;
        
        if (selectedValue === 'in-progress') {
            showNotification('Status updated to In Progress', 'info');
        } else if (selectedValue === 'completed') {
            showNotification('Status updated to Completed', 'success');
        }
    });
});

// Handle update button clicks
document.querySelectorAll('.btn-update').forEach((btn) => {
    btn.addEventListener('click', function() {
        const jobCard = this.closest('.job-card');
        const dropdown = jobCard.querySelector('.status-dropdown');
        const statusBadge = jobCard.querySelector('.status-badge');
        const residentInfo = jobCard.querySelector('.resident-info').textContent;
        const selectedValue = dropdown.value;

        if (!selectedValue) {
            showNotification('Please select a status first', 'error');
            return;
        }

        // Update the status badge
        if (selectedValue === 'in-progress') {
            statusBadge.textContent = 'In Progress';
            statusBadge.classList.remove('accepted', 'completed');
            statusBadge.classList.add('in-progress');
        } else if (selectedValue === 'completed') {
            statusBadge.textContent = 'Completed';
            statusBadge.classList.remove('accepted', 'in-progress');
            statusBadge.classList.add('completed');
            
            // Hide update controls for completed jobs
            const statusChange = jobCard.querySelector('.status-change');
            statusChange.style.display = 'none';
        }

        // Reset dropdown
        dropdown.value = '';
        
        console.log(`Job status updated for ${residentInfo} to ${selectedValue}`);
        showNotification(`Job status updated successfully!`, 'success');
    });
});

/**
 * Show notification message
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        background-color: ${type === 'success' ? '#2e7d32' : type === 'error' ? '#d32f2f' : '#1976d2'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: -0.2px;
    `;
    
    // Add style animation
    const style = document.createElement('style');
    if (!document.querySelector('style[data-notification]')) {
        style.setAttribute('data-notification', 'true');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Update Job Status page initialized');
});
