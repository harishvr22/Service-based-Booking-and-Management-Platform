document.addEventListener('DOMContentLoaded', () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('No userId found in resident_support.js');
        return;
    }

    fetchUserComplaints(userId);
});

async function fetchUserComplaints(userId) {
    const list = document.getElementById('complaintList');
    try {
        const response = await fetch(`${API_BASE_URL}/admin/complaints`); // Using existing admin route but we will filter
        const data = await response.json();
        
        if (data.status === 'success') {
            // Filter complaints for this user only
            const myComplaints = data.complaints.filter(c => c.user_id == userId);
            
            if (myComplaints.length === 0) {
                list.innerHTML = '<p style="color: #888; text-align: center; padding: 40px;">No support tickets raised yet.</p>';
                return;
            }

            list.innerHTML = '';
            myComplaints.forEach(c => {
                const item = document.createElement('div');
                item.className = 'complaint-item';
                item.innerHTML = `
                    <div>
                        <h4 style="margin-bottom: 5px;">${c.title}</h4>
                        <p style="font-size: 12px; color: #888;">${c.date} • Priority: ${c.priority.toUpperCase()}</p>
                    </div>
                    <span class="status-badge status-${c.status}">${c.status}</span>
                `;
                list.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error fetching complaints:', error);
        list.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 40px;">Failed to load tickets.</p>';
    }
}

// Custom Alert Logic
function showCustomAlert(title, message, type = 'success') {
    const modal = document.getElementById('alertModal');
    const icon = document.getElementById('alertIcon');
    const titleEl = document.getElementById('alertTitle');
    const msgEl = document.getElementById('alertMessage');
    
    icon.innerHTML = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
    icon.className = `alert-icon ${type}`;
    titleEl.textContent = title;
    msgEl.textContent = message;
    
    modal.style.display = 'flex';
}

window.closeAlert = function() {
    document.getElementById('alertModal').style.display = 'none';
};

window.submitComplaint = function() {
    const residentId = sessionStorage.getItem('userId') || '1';
    const title = document.getElementById('complaintTitle').value.trim();
    const description = document.getElementById('complaintDesc').value.trim();
    const priority = document.getElementById('complaintPriority').value;
    
    if (!title || !description) {
        showCustomAlert('Required', 'Please fill in both subject and description.', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'SUBMITTING...';
    submitBtn.disabled = true;
    
    const payload = {
        user_id: userId,
        title: title,
        description: description,
        priority: priority
    };
    
    fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Server error');
        return data;
    })
    .then(data => {
        if (data.status === 'success') {
            showCustomAlert('Ticket Raised', 'Support ticket raised successfully! Admin will review it shortly.', 'success');
            document.getElementById('complaintTitle').value = '';
            document.getElementById('complaintDesc').value = '';
            fetchUserComplaints(userId); // Refresh list
        } else {
            showCustomAlert('Error', data.message, 'error');
        }
    })
    .catch(err => {
        console.error('Error submitting complaint:', err);
        showCustomAlert('Submission Failed', err.message, 'error');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
};

let confirmCallback = null;

function showCustomConfirm(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = onConfirm;
    modal.style.display = 'flex';
}

window.closeConfirm = function(isConfirmed) {
    document.getElementById('confirmModal').style.display = 'none';
    if (isConfirmed && confirmCallback) {
        confirmCallback();
    }
    confirmCallback = null;
};

window.clearMyComplaints = function() {
    const userId = sessionStorage.getItem('userId');
    
    showCustomConfirm(
        'Clear History', 
        'Are you sure you want to clear your complaint history? This will delete all your past records from the database.',
        () => {
            fetch(`${API_BASE_URL}/complaints?user_id=${userId}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    showCustomAlert('Cleared', 'Your complaint history has been cleared.', 'success');
                    fetchUserComplaints(userId);
                } else {
                    showCustomAlert('Error', data.message, 'error');
                }
            })
            .catch(err => {
                console.error('Error clearing history:', err);
                showCustomAlert('Error', 'Failed to clear history from server.', 'error');
            });
        }
    );
};
