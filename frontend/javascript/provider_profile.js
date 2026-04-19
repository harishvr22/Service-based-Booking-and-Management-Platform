/**
 * Provider Profile – Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.querySelector('.btn-save-changes');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const btn = saveBtn;
            const originalText = btn.textContent;
            
            // Visual feedback on save
            btn.textContent = 'Saving...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = 'Saved!';
                btn.style.background = '#2ecc71';
                btn.style.color = '#000';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = 'var(--orange)';
                    btn.style.opacity = '1';
                    btn.disabled = false;
                }, 2000);
            }, 800);
        });
    }
});
