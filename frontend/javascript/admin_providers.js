document.addEventListener('DOMContentLoaded', () => {
    const providerSearch = document.getElementById('providerSearch');
    const categorySelect = document.querySelector('.category-select select');
    const providerCards = document.querySelectorAll('.provider-card');

    function filterProviders() {
        const searchTerm = providerSearch.value.toLowerCase();
        const selectedCategory = categorySelect.value.toLowerCase();

        providerCards.forEach(card => {
            const providerName = card.querySelector('h3').textContent.toLowerCase();
            const specialization = card.querySelector('.specialization p').textContent.toLowerCase();
            const categoryTag = card.querySelector('.tag').textContent.toLowerCase();

            const matchesSearch = providerName.includes(searchTerm) || specialization.includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || categoryTag === selectedCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (providerSearch) {
        providerSearch.addEventListener('input', filterProviders);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', filterProviders);
    }

    // Add action button handlers
    const approveBtns = document.querySelectorAll('.btn-approve');
    const rejectBtns = document.querySelectorAll('.btn-reject');
    const suspendBtns = document.querySelectorAll('.btn-suspend');

    approveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.closest('.provider-card').querySelector('h3').textContent;
            alert(`Approved ${name}`);
        });
    });

    rejectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.closest('.provider-card').querySelector('h3').textContent;
            alert(`Rejected ${name}`);
        });
    });

    suspendBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.closest('.provider-card').querySelector('h3').textContent;
            alert(`Suspended ${name}`);
        });
    });
});
