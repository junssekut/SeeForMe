document.addEventListener('DOMContentLoaded', function() {
    new Notify ({
        status: 'info',
        title: '',
        text: 'Press SPACE to Start See For Me.',
        effect: 'fade',
        speed: 500,
        customClass: '',
        customIcon: '',
        showIcon: true,
        showCloseButton: false,
        autoclose: true,
        autotimeout: 3000,
        notificationsGap: null,
        notificationsPadding: null,
        type: 'outline',
        position: 'left top',
        customWrapper: '',
    });

    const scrollDownElement = document.getElementById('scroll-down');
    if (scrollDownElement) {
        scrollDownElement.addEventListener('click', function () {
            console.log(scrollDownElement.style.rotate);
            if (scrollDownElement.style.rotate === '') {
                document.getElementById('content-1').scrollIntoView({ behavior: 'smooth' });
            } else {
                document.getElementById('content-base').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (window.innerWidth <= 768) { 
        let touchStartX = 0;
        let touchEndX = 0;

        function handleGesture() {
            if (touchEndX < touchStartX - 50) {
                if (window.location.pathname.endsWith('index.html')) {
                    window.location.href = 'seeforme.html'; 
                }
            }

            if (touchEndX > touchStartX + 50) {
                if (window.location.pathname.endsWith('seeforme.html')) {
                    window.location.href = 'index.html'; 
                }
            }
        }

        document.addEventListener('touchstart', function(event) {
            touchStartX = event.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', function(event) {
            touchEndX = event.changedTouches[0].screenX;
            handleGesture();
        });
    }

    window.addEventListener('scroll', function() {
        const scrollTo = '130px';
        if ((window.innerHeight + window.scrollY + 10) >= document.documentElement.scrollHeight) {
            if (document.getElementById('floating-button')) document.getElementById('floating-button').style.bottom = scrollTo;
            if (this.document.getElementById('scroll-down')) document.getElementById('scroll-down').style.rotate = '-180deg';
        } else {
            if (document.getElementById('floating-button').style.bottom === scrollTo) {
                document.getElementById('floating-button').style.bottom = '40px'
            }

            if (this.document.getElementById('scroll-down')) this.document.getElementById('scroll-down').style.rotate = '';
        }
    });

    document.querySelectorAll('.information-button').forEach((element) => {
        element.addEventListener('click', () => {
            var link = '';
            switch (element.getAttribute('id')) {
                case 'youtube':
                    link = 'https://youtube.com/';
                    break;
                case 'phone':
                    link = 'tel:+628333999666';
                    break;
                case 'instagram':
                    link = 'https://instagram.com/';
                    break;
                case 'email':
                    link = 'mailto:seeforme@gmail.com';
                    break;
                case 'x':
                    link = 'https://x.com/';
                    break;
                default:
                    break;
            }
            window.open(link, '_blank');
        });
    });

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                
                window.location.href = 'seeforme.html';
            } else if (window.location.pathname.includes('seeforme.html')) {
                
                window.location.href = 'index.html';
            }
        }
    });

    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        console.log('test');
        particlesJS.load('particles-js', './assets/js/particlesjs-config.json', function() {
            console.log('callback - particles.js config loaded');
        });
    }
});

