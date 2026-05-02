document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    fetchUserComplaints(userId);
});

async function fetchUserComplaints(userId) {
    const list = document.getElementById('complaintList');
    try {
        const response = await fetch(`http://localhost:5000/admin/complaints`); // Using existing admin route but we will filter
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

window.submitComplaint = function() {
    const userId = localStorage.getItem('userId');
    const title = document.getElementById('complaintTitle').value.trim();
    const description = document.getElementById('complaintDesc').value.trim();
    const priority = document.getElementById('complaintPriority').value;
    
    if (!title || !description) {
        alert('Please fill in both subject and description.');
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
    
    fetch('http://localhost:5000/complaints', {
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
            alert('Support ticket raised successfully!');
            document.getElementById('complaintTitle').value = '';
            document.getElementById('complaintDesc').value = '';
            fetchUserComplaints(userId); // Refresh list
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error submitting complaint:', err);
        alert('Failed to submit: ' + err.message);
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
};
