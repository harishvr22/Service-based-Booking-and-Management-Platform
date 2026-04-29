document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Complaints JS Initialized');
    
    const API_BASE_URL = 'http://127.0.0.1:5000';
    let complaintsData = [];
    
    // Load complaints from API
    async function loadComplaints() {
        const container = document.getElementById('complaintsContainer');
        
        // Show loading state
        if (container) {
            container.innerHTML = '<p class="loading-state" style="text-align:center;width:100%;color:#888;padding:20px;">Loading complaints...</p>';
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/complaints`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            complaintsData = data.complaints || [];
            
            renderComplaints();
        } catch (error) {
            console.error('Error loading complaints:', error);
            
            // Don't show error notification for development, just log it
            if (error.message.includes('Failed to fetch')) {
                console.log('API endpoint not available yet - showing empty state');
            } else {
                showToast('Failed to load complaints', 'error');
            }
            
            complaintsData = [];
            renderComplaints(); // Show empty state
        }
    }
    
    // Render complaints dynamically
    function renderComplaints() {
        const container = document.getElementById('complaintsContainer');
        if (!container) return;

        container.innerHTML = '';

        if (complaintsData.length === 0) {
            container.innerHTML = '<p class="no-data" style="text-align:center;width:100%;color:#888;padding:40px;">No complaints found. Check your database connection.</p>';
            return;
        }

        complaintsData.forEach(complaint => {
            const complaintElement = createComplaintElement(complaint);
            container.appendChild(complaintElement);
        });

        // Initialize event listeners after rendering
        initComplaintActions();
    }
    
    // Create complaint element
    function createComplaintElement(complaint) {
        const div = document.createElement('div');
        div.className = `complaint-item priority-${complaint.priority || 'medium'}`;
        div.dataset.complaintId = complaint.id;

        const priorityClass = `comp-${complaint.priority || 'med'}`;
        const statusClass = complaint.status === 'resolved' ? 'comp-res' : 'comp-open';
        const opacity = complaint.status === 'resolved' ? '0.7' : '1';

        div.innerHTML = `
            <div class="comp-badges">
                <span class="comp-id">${complaint.id || 'C-7000'}</span>
                <span class="comp-badge ${priorityClass}">${(complaint.priority || 'MEDIUM').toUpperCase()} PRIORITY</span>
                <span class="comp-badge ${statusClass}">${complaint.status ? complaint.status.toUpperCase() : 'OPEN'}</span>
            </div>
            <h3 class="comp-title">${complaint.title || 'No Title'}</h3>
            <p class="comp-meta"><i class="fas fa-user"></i> ${complaint.user_name || 'Unknown User'} &bull; <i class="fas fa-calendar-alt"></i> ${complaint.date || 'No Date'}</p>
            <div class="comp-quote">"${complaint.description || 'No description provided.'}"</div>
            <div class="comp-actions">
                ${complaint.status === 'resolved' ? 
                    `<span style="color: #888; font-size: 12px;">RESOLVED</span>` :
                    `<button class="comp-btn"><i class="far fa-check-circle"></i> MARK RESOLVED</button>
                     <button class="comp-btn btn-outline"><i class="fas fa-envelope"></i> CONTACT USER</button>`
                }
            </div>
        `;

        div.style.opacity = opacity;
        return div;
    }
    
    // Initialize event listeners for complaint actions
    function initComplaintActions() {
        const resolveButtons = document.querySelectorAll('.comp-btn:not(.btn-outline)');
        
        resolveButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const complaintItem = e.target.closest('.complaint-item');
                const complaintId = complaintItem.dataset.complaintId;
                
                handleResolveComplaint(complaintId, complaintItem);
            });
        });

        const contactButtons = document.querySelectorAll('.comp-btn.btn-outline');
        contactButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const complaintItem = e.target.closest('.complaint-item');
                const userName = complaintItem.querySelector('.comp-meta').textContent.split('•')[0].trim();
                
                openMessageModal(userName);
            });
        });

        // Modal close events
        const closeBtn = document.getElementById('closeMsgModal');
        const cancelBtn = document.getElementById('cancelMsgBtn');
        if (closeBtn) closeBtn.addEventListener('click', closeMessageModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeMessageModal);

        // Send message logic
        const sendBtn = document.getElementById('sendMsgBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', handleSendMessage);
        }
    }
    
    // Load complaints on page load
    loadComplaints();
});


/**
 * Open the message modal
 * @param {string} name - User's name
 */
function openMessageModal(name) {
    const modal = document.getElementById('messageModal');
    const targetName = document.getElementById('msgTargetName');
    const subject = document.getElementById('msgSubject');
    const content = document.getElementById('msgContent');
    
    targetName.textContent = name;
    subject.value = '';
    content.value = '';
    
    modal.classList.add('open');
}

/**
 * Close the message modal
 */
function closeMessageModal() {
    const modal = document.getElementById('messageModal');
    modal.classList.remove('open');
}

/**
 * Handle sending a message
 */
async function handleSendMessage() {
    const API_BASE = 'http://localhost:5000';
    const sendBtn = document.getElementById('sendMsgBtn');
    const subjectInput = document.getElementById('msgSubject');
    const contentInput = document.getElementById('msgContent');
    const subject = subjectInput.value.trim();
    const content = contentInput.value.trim();
    const targetName = document.getElementById('msgTargetName').textContent;

    if (!subject || !content) {
        showToast('Please fill in both subject and content.', 'error');
        return;
    }

    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING...';
    sendBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: subject,
                message: content,
                audience: 'Residents', // Targeted at residents
                created_by: 'Admin'
            })
        });

        if (!response.ok) throw new Error('Send failed');

        showToast(`Message sent to ${targetName} successfully!`, 'success');
        closeMessageModal();
        subjectInput.value = '';
        contentInput.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Failed to send message to server.', 'error');
        
        // Fallback to localStorage
        const newNotif = {
            id: Date.now().toString(),
            title: subject,
            message: content,
            audience: 'Residents',
            date: new Date().toISOString(),
            read: false,
            iconClass: 'far fa-envelope'
        };
        const allNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        allNotifs.unshift(newNotif);
        localStorage.setItem('admin_notifications', JSON.stringify(allNotifs));
    } finally {
        sendBtn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right: 6px;"></i> SEND NOTIFICATION';
        sendBtn.disabled = false;
    }
}

/**
 * Handle resolving a complaint
 * @param {string} id - The complaint ID
 * @param {HTMLElement} element - The complaint DOM element
 */
function handleResolveComplaint(id, element) {
    // In a real app, this would be an API call
    console.log(`Resolving complaint: ${id}`);
    
    // Show a confirmation or loading state
    const btn = element.querySelector('.comp-btn:not(.btn-outline)');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING...';
    btn.disabled = true;

    // Simulate API delay
    setTimeout(() => {
        // Update the UI to show it's resolved
        const statusBadge = element.querySelector('.comp-badge:last-child');
        if (statusBadge) {
            statusBadge.textContent = 'RESOLVED';
            statusBadge.className = 'comp-badge comp-res';
        }

        // Fade out or dim the item
        element.style.opacity = '0.7';
        element.style.transition = 'opacity 0.5s ease';
        
        // Remove the resolve button
        btn.remove();

        // Optional: show a success message (if a toast system exists)
        showToast(`Complaint ${id} has been marked as resolved.`, 'success');
        
        // Update data in localStorage if needed
        updateComplaintStatusInStorage(id, 'RESOLVED');
    }, 1000);
}

/**
 * Update complaint status in localStorage
 * @param {string} id 
 * @param {string} status 
 */
function updateComplaintStatusInStorage(id, status) {
    let complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
        complaints[index].status = status;
        localStorage.setItem('complaints', JSON.stringify(complaints));
    }
}

/**
 * Mock function to show toast notifications
 * @param {string} message 
 * @param {string} type 
 */
function showToast(message, type = 'info') {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#2ecc71' : '#3498db'};
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out forwards;
    `;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${message}`;
    
    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Load complaints from storage or populate with defaults
 */
function loadComplaints() {
    // This function can be used to dynamically render complaints
    // For now, we'll just log that it's ready
    console.log('Loading complaints data...');
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
