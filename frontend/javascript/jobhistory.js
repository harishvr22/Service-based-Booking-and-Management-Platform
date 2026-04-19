/**
 * JobHistory – Provider Dashboard
 * Displays a complete archive of completed jobs and ratings.
 */

// ── Hardcoded History Data from Screenshot ────────────────────────

const HISTORY_DATA = [
  {
    id: 'REQ-1001',
    title: 'Electrical — Fan Installation',
    resident: 'Aarav Sharma',
    date: 'Apr 20, 2026',
    rating: 0, // 0 stars filled
    status: 'Completed'
  },
  {
    id: 'REQ-0988',
    title: 'AC Service — Deep Clean',
    resident: 'Rohan Kapoor',
    date: 'Apr 18, 2026',
    rating: 0,
    status: 'Completed'
  },
  {
    id: 'REQ-0995',
    title: 'Cleaning — Deep Cleaning',
    resident: 'Neha Singh',
    date: 'Apr 14, 2026',
    rating: 5,
    status: 'Completed'
  },
  {
    id: 'REQ-0990',
    title: 'Maintenance — Door Repair',
    resident: 'Vikram Joshi',
    date: 'Apr 09, 2026',
    rating: 4,
    status: 'Completed'
  }
];

document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('history-list');
    
    if (!listEl) return;

    if (HISTORY_DATA.length === 0) {
        listEl.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #555;">
                <p>No completed jobs found.</p>
            </div>`;
        return;
    }

    listEl.innerHTML = HISTORY_DATA.map(job => {
        // Render 5 stars based on rating
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= job.rating) {
                starsHtml += `<i class="fas fa-star hist-star filled"></i>`;
            } else {
                starsHtml += `<i class="far fa-star hist-star"></i>`;
            }
        }

        return `
            <div class="history-row">
                <div class="hist-job-col">
                    <span class="hist-job-title">${job.title}</span>
                    <span class="hist-job-id">${job.id}</span>
                </div>
                <div class="hist-resident-col">${job.resident}</div>
                <div class="hist-date-col">${job.date}</div>
                <div class="hist-rating-col">
                    ${starsHtml}
                </div>
                <div class="hist-status-col">
                    <span class="hist-status-badge">${job.status}</span>
                </div>
            </div>
        `;
    }).join('');
});