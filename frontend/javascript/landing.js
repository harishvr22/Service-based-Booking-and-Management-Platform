// Handle navigation buttons
document.addEventListener('DOMContentLoaded', function() {
    // Nav button handlers
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-signup');
    const getStartedBtn = document.querySelector('.btn-primary');
    const learnMoreBtn = document.querySelector('.btn-secondary');

    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            window.location.href = 'signup.html';
        });
    }

    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            window.location.href = 'signup.html';
        });
    }

    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            document.querySelector('.how-it-works').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
