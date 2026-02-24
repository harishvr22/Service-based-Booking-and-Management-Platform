document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab-btn');
    const tableBody = document.getElementById('userTableBody');
    const searchInput = document.getElementById('userSearch');

    // Sample Data
    const users = {
        residents: [
            { name: 'John Doe', email: 'john@apt.com', phone: '+91 98765 00001', flat: 'A-101', block: 'A Block', moveIn: 'Jan 2024', status: 'Active' },
            { name: 'Jane Smith', email: 'jane@apt.com', phone: '+91 98765 00002', flat: 'B-205', block: 'B Block', moveIn: 'Mar 2024', status: 'Active' },
            { name: 'Mike Wilson', email: 'mike@apt.com', phone: '+91 98765 00003', flat: 'C-302', block: 'C Block', moveIn: 'Jun 2023', status: 'Active' },
            { name: 'Sara Lee', email: 'sara@apt.com', phone: '+91 98765 00004', flat: 'A-404', block: 'A Block', moveIn: 'Nov 2024', status: 'Active' },
            { name: 'Ravi Patel', email: 'ravi@apt.com', phone: '+91 98765 00005', flat: 'D-110', block: 'D Block', moveIn: 'Feb 2025', status: 'Inactive' }
        ],
        providers: [
            { name: 'FixIt Plumbing', email: 'contact@fixit.com', phone: '+91 98765 11111', category: 'Plumbing', rating: '4.8', status: 'Active' },
            { name: 'Bright Lights', email: 'info@brightlights.com', phone: '+91 98765 22222', category: 'Electrical', rating: '4.5', status: 'Active' },
            { name: 'Sparkle Clean', email: 'hello@sparkle.com', phone: '+91 98765 33333', category: 'Cleaning', rating: '4.9', status: 'Active' },
            { name: 'Wood Works', email: 'build@woodworks.com', phone: '+91 98765 44444', category: 'Carpentry', rating: '4.2', status: 'Pending' }
        ],
        admins: [
            { name: 'Admin User', email: 'admin@apartmentcare.com', phone: '+91 98765 99999', role: 'Super Admin', lastLogin: 'Today, 10:45 AM', status: 'Active' }
        ]
    };

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTable(tab.dataset.tab);
        });
    });

    function renderTable(type) {
        let html = '';
        const data = users[type];

        if (type === 'residents') {
            data.forEach(user => {
                html += `
                    <tr>
                        <td class="font-600">${user.name}</td>
                        <td class="text-light">${user.email}</td>
                        <td class="text-light">${user.phone}</td>
                        <td>
                            <div class="flat-info">
                                <span class="flat-number">${user.flat}</span>
                                <span class="block-name">${user.block}</span>
                            </div>
                        </td>
                        <td class="text-light">${user.moveIn}</td>
                        <td><span class="badge badge-${user.status.toLowerCase()}">${user.status}</span></td>
                    </tr>
                `;
            });
        } else if (type === 'providers') {
            // Update table headers dynamically if needed, but for simplicity we'll just show data in the same columns
            data.forEach(user => {
                html += `
                    <tr>
                        <td class="font-600">${user.name}</td>
                        <td class="text-light">${user.email}</td>
                        <td class="text-light">${user.phone}</td>
                        <td>
                            <div class="flat-info">
                                <span class="flat-number">${user.category}</span>
                                <span class="block-name">Rating: ${user.rating}</span>
                            </div>
                        </td>
                        <td class="text-light">-</td>
                        <td><span class="badge badge-${user.status.toLowerCase()}">${user.status}</span></td>
                    </tr>
                `;
            });
        } else if (type === 'admins') {
            data.forEach(user => {
                html += `
                    <tr>
                        <td class="font-600">${user.name}</td>
                        <td class="text-light">${user.email}</td>
                        <td class="text-light">${user.phone}</td>
                        <td>
                            <div class="flat-info">
                                <span class="flat-number">${user.role}</span>
                                <span class="block-name">L: ${user.lastLogin}</span>
                            </div>
                        </td>
                        <td class="text-light">-</td>
                        <td><span class="badge badge-${user.status.toLowerCase()}">${user.status}</span></td>
                    </tr>
                `;
            });
        }

        tableBody.innerHTML = html;
    }

    // Basic Search Functionality
    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const rows = tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
});
