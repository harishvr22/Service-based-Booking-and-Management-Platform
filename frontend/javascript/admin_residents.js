document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('residentSearch');
    const blockFilter = document.getElementById('blockFilter');
    const residentsGrid = document.getElementById('residentsGrid');
    const residentCards = residentsGrid.querySelectorAll('.resident-card');

    // Function to filter residents
    const filterResidents = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedBlock = blockFilter.value;

        residentCards.forEach(card => {
            const name = card.querySelector('.name').textContent.toLowerCase();
            const email = card.querySelector('.email').textContent.toLowerCase();
            const phone = card.querySelector('.phone').textContent.toLowerCase();
            const flatInfo = card.querySelector('.label').textContent.toLowerCase();
            const block = card.dataset.block;

            const matchesSearch = name.includes(searchTerm) ||
                email.includes(searchTerm) ||
                phone.includes(searchTerm) ||
                flatInfo.includes(searchTerm);

            const matchesBlock = selectedBlock === 'all' || block === selectedBlock;

            if (matchesSearch && matchesBlock) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };

    // Event Listeners
    searchInput.addEventListener('input', filterResidents);
    blockFilter.addEventListener('change', filterResidents);

    // Button Handlers (Suspend/Activate)
    residentsGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const card = btn.closest('.resident-card');
        const badge = card.querySelector('.badge');
        const name = card.querySelector('.name').textContent;

        if (btn.classList.contains('btn-suspend')) {
            if (confirm(`Are you sure you want to suspend ${name}?`)) {
                badge.className = 'badge badge-inactive';
                badge.textContent = 'Suspended';
                btn.className = 'btn-activate';
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Activate';
            }
        } else if (btn.classList.contains('btn-activate')) {
            badge.className = 'badge badge-active';
            badge.textContent = 'Active';
            btn.className = 'btn-suspend';
            btn.innerHTML = '<i class="fas fa-ban"></i> Suspend';
        }
    });

    // Sidebar navigation (highlighting active link is handled by HTML class 'active' in these templates)
});
