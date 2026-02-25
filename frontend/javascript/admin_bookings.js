document.addEventListener('DOMContentLoaded', () => {
    const bookingSearch = document.getElementById('bookingSearch');
    const statusSelect = document.querySelector('.status-select');
    const tableRows = document.querySelectorAll('.user-table tbody tr');

    function filterTable() {
        const searchTerm = bookingSearch.value.toLowerCase();
        const selectedStatus = statusSelect.value.toLowerCase();

        tableRows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            const statusBadge = row.querySelector('.badge-status');
            const status = statusBadge ? statusBadge.textContent.toLowerCase() : '';

            const matchesSearch = rowText.includes(searchTerm);
            const matchesStatus = selectedStatus === 'all' || status === selectedStatus;

            if (matchesSearch && matchesStatus) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    if (bookingSearch) {
        bookingSearch.addEventListener('input', filterTable);
    }

    if (statusSelect) {
        statusSelect.addEventListener('change', filterTable);
    }
});
