document.addEventListener('DOMContentLoaded', function() {
    const scrollDownElement = document.getElementById('scroll-down');
    if (scrollDownElement) {
        scrollDownElement.addEventListener('click', function () {
            document.getElementById('content-1').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (window.innerWidth <= 768) { // Check if the screen width is mobile size or smaller
        let touchStartX = 0;
        let touchEndX = 0;

        function handleGesture() {
            if (touchEndX < touchStartX - 50) {
                // Swipe left
                if (window.location.pathname.endsWith('index.html')) {
                    window.location.href = 'seeforme.html'; // Redirect to seeforme.html on swipe left from index.html
                }
            }

            if (touchEndX > touchStartX + 50) {
                // Swipe right
                if (window.location.pathname.endsWith('seeforme.html')) {
                    window.location.href = 'index.html'; // Redirect to index.html on swipe right from seeforme.html
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
            document.getElementById('floating-button').style.bottom = scrollTo;
        } else {
            if (document.getElementById('floating-button').style.bottom = scrollTo) {
                document.getElementById('floating-button').style.bottom = '40px'
            }
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
            // Check the current page URL
            if (window.location.pathname.includes('index.html')) {
                // If on index.html, redirect to seeforme.html
                window.location.href = 'seeforme.html';
            } else if (window.location.pathname.includes('seeforme.html')) {
                // If on seeforme.html, redirect to index.html
                window.location.href = 'index.html';
            }
        }
    });
    
});

