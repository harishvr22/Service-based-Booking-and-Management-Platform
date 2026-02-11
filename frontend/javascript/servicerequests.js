/**
 * Service Requests Page JavaScript
 */

// Update Job Status Button Handler
document.querySelector('.update-status-btn')?.addEventListener('click', () => {
    console.log('Update Job Status clicked');
    // Navigate to job update page or open modal
});

// Accept Button Handlers
document.querySelectorAll('.btn-accept').forEach((btn) => {
    btn.addEventListener('click', function() {
        const requestCard = this.closest('.request-card');
        const statusBadge = requestCard.querySelector('.status-badge');
        const residentInfo = requestCard.querySelector('.resident-info').textContent;
        
        // Update status badge
        statusBadge.textContent = 'Accepted';
        statusBadge.classList.remove('pending');
        statusBadge.classList.add('accepted');
        
        // Disable action buttons
        disableActionButtons(requestCard);
        
        console.log('Request accepted:', residentInfo);
        showNotification('Request accepted successfully!', 'success');
    });
});

// Reject Button Handlers
document.querySelectorAll('.btn-reject').forEach((btn) => {
    btn.addEventListener('click', function() {
        const requestCard = this.closest('.request-card');
        const statusBadge = requestCard.querySelector('.status-badge');
        const residentInfo = requestCard.querySelector('.resident-info').textContent;
        
        // Update status badge
        statusBadge.textContent = 'Rejected';
        statusBadge.classList.remove('pending');
        statusBadge.classList.add('rejected');
        
        // Disable action buttons
        disableActionButtons(requestCard);
        
        console.log('Request rejected:', residentInfo);
        showNotification('Request rejected successfully!', 'success');
    });
});

/**
 * Disable action buttons for a request card
 * @param {HTMLElement} requestCard - The request card element
 */
function disableActionButtons(requestCard) {
    const actionsDiv = requestCard.querySelector('.request-actions');
    if (actionsDiv) {
        actionsDiv.style.display = 'none';
    }
}

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
        background-color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
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
    console.log('Service Requests page initialized');
});
