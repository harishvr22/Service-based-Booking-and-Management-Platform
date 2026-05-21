/**
 * JobHistory – Provider Dashboard
 * Fetches completed jobs from the backend.
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchHistory();
    setupSearch();
});

let historyData = [];

async function fetchHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '<div style="text-align:center; padding: 40px; color: #888;">Fetching history...</div>';
    
    const userId = parseInt(sessionStorage.getItem('userId'));

    try {
        const response = await fetch('http://127.0.0.1:5000/bookings');
        if (!response.ok) throw new Error('Server error');
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            historyData = [];
        } else {
            // Filter for completed jobs assigned to THIS provider
            historyData = data.filter(req => req.status === 'completed' && req.provider_id == userId).map(req => ({
                id: req.id.toString(),
                title: req.service_name || 'Service Request',
                status: req.status,
                name: req.resident_name || `Resident #${req.resident_id}`,
                contact: req.mobile_number || 'No contact provided',
                block: req.apartment_id || 'N/A',
                problem: req.problem_description || 'No description provided',
                date: req.preferred_date || 'N/A',
                rating: req.rating,
                review: req.review
            }));
        }
        renderHistory(historyData);
    } catch (error) {
        console.error('Error fetching history:', error);
        historyData = [];
        renderHistory([]); // Show empty state on error
    }
}

function renderHistory(items) {
    const list = document.getElementById('history-list');
    list.innerHTML = '';

    if (items.length === 0) {
        list.innerHTML = `
            <div class="sr-empty">
                <i class="fas fa-history"></i>
                <p>No job history found.</p>
            </div>`;
        return;
    }

    items.forEach(req => {
        const card = document.createElement('div');
        card.className = 'sr-card';
        card.style.borderLeft = '4px solid #2ecc71'; // Green for completed
        
        let reviewHtml = '';
        if (req.rating) {
            const stars = '★'.repeat(req.rating) + '☆'.repeat(5 - req.rating);
            reviewHtml = `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #333;">
                    <div style="color: #ffb800; font-size: 14px; margin-bottom: 4px;">${stars}</div>
                    <div style="color: #aaa; font-size: 13px; font-style: italic;">"${req.review || ''}"</div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="sr-card-left">
                <div class="sr-card-meta">
                    <span class="sr-card-id">#${req.id}</span>
                    <span class="sr-badge completed">Completed</span>
                    <span style="color: #666; font-size: 12px; margin-left: 10px;">${req.date}</span>
                </div>
                <div class="sr-card-title">${req.title}</div>
                <div class="sr-card-info">
                    <div class="sr-card-info-item"><i class="far fa-user"></i> ${req.name}</div>
                    <div class="sr-card-info-item"><i class="fas fa-map-marker-alt"></i> ${req.block}</div>
                    <div class="sr-card-info-item"><i class="fas fa-exclamation-circle"></i> ${req.problem}</div>
                </div>
                ${reviewHtml}
            </div>`;
        list.appendChild(card);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('sr-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = historyData.filter(req => 
            req.title.toLowerCase().includes(query) || 
            req.name.toLowerCase().includes(query) || 
            req.id.includes(query) ||
            req.block.toLowerCase().includes(query)
        );
        renderHistory(filtered);
    });
}