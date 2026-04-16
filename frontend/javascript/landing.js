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
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
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

    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', function () {
            const action = this.dataset.action;
            if (!action) return;

            switch (action) {
                case 'book-service':
                case 'become-provider':
                case 'join-provider':
                case 'get-started':
                case 'book-now':
                    window.location.href = 'signup.html';
                    break;
                default:
                    break;
            }
        });
    });

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

    // Experience image slider
    const experienceSlider = document.querySelector('.experience-slider');
    if (experienceSlider) {
        const experienceImages = [
            '../assets/ac service.png',
            '../assets/carpentering.png',
            '../assets/cleaning.png',
            '../assets/electrical.png',
            '../assets/plumber.png',
            '../assets/painting.png'
        ];
        let experienceIndex = 0;
        experienceSlider.style.backgroundImage = `url("${encodeURI(experienceImages[experienceIndex])}")`;

        setInterval(() => {
            experienceSlider.style.opacity = '0';
            experienceIndex = (experienceIndex + 1) % experienceImages.length;
            setTimeout(() => {
                experienceSlider.style.backgroundImage = `url("${encodeURI(experienceImages[experienceIndex])}")`;
                experienceSlider.style.opacity = '1';
            }, 350);
        }, 4000);
    }
});
