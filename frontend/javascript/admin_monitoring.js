document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5000';
    let currentTab = 'ongoing';
    let allBookings = [];
    let filteredBookings = [];

    
    // Initialize the monitoring page
    function initializeMonitoring() {
        loadBookings();
        attachEventListeners();
        updateStats();
    }

    // Load bookings data
    async function loadBookings() {
        try {
            // Fetch bookings from API
            const response = await fetch(`${API_BASE_URL}/admin/bookings`);
            const data = await response.json();
            allBookings = data.bookings || [];
            
            applyFilters();
        } catch (error) {
            console.error('Error loading bookings:', error);
            showToast('Failed to load bookings', 'error');
            // Set empty array if API fails
            allBookings = [];
            applyFilters();
        }
    }

    // Attach event listeners
    function attachEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(applyFilters, 300));
        }

        // Filter dropdowns
        const statusFilter = document.getElementById('filter-status');
        const serviceFilter = document.getElementById('filter-service');
        
        if (statusFilter) statusFilter.addEventListener('change', applyFilters);
        if (serviceFilter) serviceFilter.addEventListener('change', applyFilters);

        // Refresh button
        const refreshBtn = document.getElementById('btn-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', handleRefresh);
        }
    }

    // Apply filters and search
    function applyFilters() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('filter-status')?.value || '';
        const serviceFilter = document.getElementById('filter-service')?.value || '';

        filteredBookings = allBookings.filter(booking => {
            const matchesSearch = !searchTerm || 
                booking.service.toLowerCase().includes(searchTerm) ||
                booking.resident.toLowerCase().includes(searchTerm) ||
                booking.provider.toLowerCase().includes(searchTerm) ||
                booking.id.toLowerCase().includes(searchTerm);

            const matchesStatus = !statusFilter || booking.status === statusFilter;
            const matchesService = !serviceFilter || booking.service === serviceFilter;

            // Filter by current tab
            const matchesTab = currentTab === 'ongoing' ? 
                ['pending', 'approved', 'in-progress'].includes(booking.status) :
                booking.status === 'completed';

            return matchesSearch && matchesStatus && matchesService && matchesTab;
        });

        renderBookings();
    }

    // Render bookings list
    function renderBookings() {
        const monitorList = document.getElementById('monitor-list');
        const resultsCount = document.getElementById('results-count');

        if (!monitorList) return;

        // Update results count
        if (resultsCount) {
            resultsCount.textContent = `Showing ${filteredBookings.length} booking${filteredBookings.length !== 1 ? 's' : ''}`;
        }

        // Clear existing content
        monitorList.innerHTML = '';

        if (filteredBookings.length === 0) {
            monitorList.innerHTML = `
                <div class="monitor-empty">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No bookings found</p>
                </div>
            `;
            return;
        }

        // Render each booking
        filteredBookings.forEach(booking => {
            const bookingElement = createBookingElement(booking);
            monitorList.appendChild(bookingElement);
        });
    }

    // Create booking element
    function createBookingElement(booking) {
        const div = document.createElement('div');
        div.className = 'monitor-item';
        div.onclick = () => showBookingDetails(booking);

        const statusColor = getStatusColor(booking.status);
        const statusIcon = getStatusIcon(booking.status);

        div.innerHTML = `
            <div class="monitor-item-left">
                <div class="monitor-icon">
                    <i class="fas ${getServiceIcon(booking.service)}"></i>
                </div>
                <div class="monitor-details">
                    <h4>${booking.service} - ${booking.apartment}</h4>
                    <p>${booking.resident} • ${booking.provider}</p>
                </div>
            </div>
            <div class="monitor-item-right">
                <span style="color: ${statusColor}; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                    ${statusIcon} ${booking.status}
                </span>
                <button class="btn-action btn-view">VIEW</button>
            </div>
        `;

        return div;
    }

    // Get status color
    function getStatusColor(status) {
        const colors = {
            'pending': '#f1c40f',
            'approved': '#3498db',
            'in-progress': '#e67e22',
            'completed': '#2ecc71',
            'cancelled': '#e74c3c'
        };
        return colors[status] || '#888';
    }

    // Get status icon
    function getStatusIcon(status) {
        const icons = {
            'pending': 'fas fa-clock',
            'approved': 'fas fa-check',
            'in-progress': 'fas fa-spinner',
            'completed': 'fas fa-check-circle',
            'cancelled': 'fas fa-times'
        };
        return `<i class="${icons[status] || 'fas fa-question'}"></i>`;
    }

    // Get service icon
    function getServiceIcon(service) {
        const icons = {
            'Plumbing': 'fa-wrench',
            'Electrical': 'fa-bolt',
            'Cleaning': 'fa-broom',
            'Carpentry': 'fa-hammer'
        };
        return icons[service] || 'fa-tools';
    }

    // Show booking details modal
    function showBookingDetails(booking) {
        const modal = document.getElementById('detail-modal');
        const serviceName = document.getElementById('modal-service-name');
        const bookingId = document.getElementById('modal-booking-id');
        const modalRows = document.getElementById('modal-rows');
        const modalActions = document.getElementById('modal-action-btns');

        if (!modal) return;

        // Set header info
        serviceName.textContent = `${booking.service} - ${booking.apartment}`;
        bookingId.textContent = `Booking ID: ${booking.id}`;

        // Set booking details
        modalRows.innerHTML = `
            <div class="modal-row">
                <span>Resident</span>
                <span>${booking.resident}</span>
            </div>
            <div class="modal-row">
                <span>Provider</span>
                <span>${booking.provider}</span>
            </div>
            <div class="modal-row">
                <span>Date & Time</span>
                <span>${booking.date} at ${booking.time}</span>
            </div>
            <div class="modal-row">
                <span>Status</span>
                <span style="color: ${getStatusColor(booking.status)}; font-weight: 600;">
                    ${getStatusIcon(booking.status)} ${booking.status.toUpperCase()}
                </span>
            </div>
            <div class="modal-row">
                <span>Priority</span>
                <span>${booking.priority.toUpperCase()}</span>
            </div>
            <div class="modal-row">
                <span>Description</span>
                <span>${booking.description}</span>
            </div>
        `;

        // Set action buttons based on status
        let actionButtons = '';
        if (booking.status === 'pending') {
            actionButtons = `
                <button class="btn-action btn-view" onclick="updateBookingStatus('${booking.id}', 'approved')">APPROVE</button>
                <button class="btn-action btn-cancel" onclick="updateBookingStatus('${booking.id}', 'cancelled')">CANCEL</button>
            `;
        } else if (booking.status === 'approved') {
            actionButtons = `
                <button class="btn-action btn-view" onclick="updateBookingStatus('${booking.id}', 'in-progress')">START</button>
                <button class="btn-action btn-cancel" onclick="updateBookingStatus('${booking.id}', 'cancelled')">CANCEL</button>
            `;
        } else if (booking.status === 'in-progress') {
            actionButtons = `
                <button class="btn-action btn-view" onclick="updateBookingStatus('${booking.id}', 'completed')">COMPLETE</button>
                <button class="btn-action btn-escalate" onclick="escalateBooking('${booking.id}')">ESCALATE</button>
            `;
        } else {
            actionButtons = `
                <button class="btn-action btn-view" onclick="closeModal('detail-modal')">CLOSE</button>
            `;
        }

        modalActions.innerHTML = actionButtons;

        // Show modal
        openModal('detail-modal');
    }

    // Update booking status
    function updateBookingStatus(bookingId, newStatus) {
        closeModal('detail-modal');
        showConfirmModal(
            'Update Status',
            `Are you sure you want to update the booking status to ${newStatus}?`,
            () => {
                // In real app, make API call
                console.log(`Updating booking ${bookingId} to ${newStatus}`);
                
                // Update local data
                const booking = allBookings.find(b => b.id === bookingId);
                if (booking) {
                    booking.status = newStatus;
                }
                
                applyFilters();
                updateStats();
                showToast(`Booking status updated to ${newStatus}`, 'success');
            }
        );
    }

    // Escalate booking
    function escalateBooking(bookingId) {
        closeModal('detail-modal');
        showConfirmModal(
            'Escalate Booking',
            'This will notify senior administrators about this booking. Continue?',
            () => {
                console.log(`Escalating booking ${bookingId}`);
                showToast('Booking escalated to senior administrators', 'warning');
            }
        );
    }

    // Switch tabs
    window.switchTab = function(tab) {
        currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.monitor-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
        
        // Re-apply filters
        applyFilters();
    };

    // Handle refresh
    window.handleRefresh = function() {
        const refreshBtn = document.getElementById('btn-refresh');
        if (refreshBtn) {
            refreshBtn.classList.add('spinning');
        }
        
        loadBookings();
        updateStats();
        
        setTimeout(() => {
            if (refreshBtn) {
                refreshBtn.classList.remove('spinning');
            }
            showToast('Data refreshed successfully', 'success');
        }, 1000);
    };

    // Update statistics
    function updateStats() {
        const stats = {
            pending: allBookings.filter(b => b.status === 'pending').length,
            inprogress: allBookings.filter(b => b.status === 'in-progress').length,
            completed: allBookings.filter(b => b.status === 'completed').length,
            cancelled: allBookings.filter(b => b.status === 'cancelled').length
        };

        document.getElementById('stat-pending').textContent = stats.pending;
        document.getElementById('stat-inprogress').textContent = stats.inprogress;
        document.getElementById('stat-completed').textContent = stats.completed;
        document.getElementById('stat-cancelled').textContent = stats.cancelled;
    }

    // Modal functions
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
        }
    }

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
        }
    };

    // Show confirmation modal
    function showConfirmModal(title, message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const confirmTitle = document.getElementById('confirm-title');
        const confirmMsg = document.getElementById('confirm-msg');
        const confirmBtn = document.getElementById('confirm-ok-btn');

        if (!modal) return;

        confirmTitle.textContent = title;
        confirmMsg.textContent = message;

        // Remove existing event listener
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Add new event listener
        newConfirmBtn.addEventListener('click', () => {
            closeModal('confirm-modal');
            if (onConfirm) onConfirm();
        });

        openModal('confirm-modal');
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        const toastIcon = document.getElementById('toast-icon');

        if (!toast || !toastMsg) return;

        toastMsg.textContent = message;
        toast.className = `toast ${type}`;
        
        // Set icon based on type
        if (type === 'success') {
            toastIcon.className = 'fas fa-check-circle';
        } else if (type === 'warning') {
            toastIcon.className = 'fas fa-exclamation-triangle';
        } else if (type === 'error') {
            toastIcon.className = 'fas fa-times-circle';
        }

        // Show toast
        toast.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize on page load
    initializeMonitoring();
});
