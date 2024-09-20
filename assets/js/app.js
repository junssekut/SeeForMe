const WINDOW_PATH = window.location.pathname;
const IS_MAIN_PAGE = WINDOW_PATH.includes('index.html') || WINDOW_PATH === '' || WINDOW_PATH === '/';
const IS_MOBILE = window.innerWidth <= 768;

function init() {
    new Notify ({
        status: 'info',
        title: '',
        text: `${IS_MAIN_PAGE ? 'Press SPACE' : 'Swipe Left'} to Start See For Me!`,
        effect: 'fade',
        speed: IS_MAIN_PAGE ? 500 : 3000,
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

    if ($('#scroll-down')) {
        $('#scroll-down').click(function() {
            if ($('#scroll-down').css('rotate') === 'none') {
                $('html, body').animate({
                    scrollTop: $('#content-1').offset().top
                }, 1000);
                return;
            }

            $('html, body').animate({
                scrollTop: $('#content-base').offset().top
            }, 1000);
        });
    }

    if (IS_MOBILE) {
        let touchStartX = 0;
        let touchEndX = 0;

        $(document).on('touchstart', function(event) {
            touchStartX = event.changedTouches[0].screenX;
        });

        $(document).on('touchend', function(event) {
            touchEndX = event.changedTouches[0].screenX;

            if (touchEndX < touchStartX - 50 && IS_MAIN_PAGE) window.location.href = 'seeforme.html'; 
            if (touchEndX > touchStartX + 50 && !IS_MAIN_PAGE) window.location.href = 'index.html';
        });
    }

    $(document).on('scroll', function() {
        const scrollTo = '130px';
        
        if ((window.innerHeight + window.scrollY + 10) >= document.documentElement.scrollHeight) {
            if ($('#floating-button')) $('#floating-button').css('bottom', scrollTo);
            if ($('#scroll-down')) $('#scroll-down').css('rotate', '-180deg');
            return;
        }

        if ($('#floating-button').css('bottom') === scrollTo) $('#floating-button').css('bottom', '40px');
        if ($('#scroll-down')) $('#scroll-down').css('rotate', '');
    });

    $('.information-button').click(function(element) {
        var link = '';
        switch (element.id) {
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

    $(document).keydown(function(event) {
        if (event.code !== 'Space') return;
        
        if (IS_MAIN_PAGE) window.location.href = 'seeforme.html';
        else window.location.href = 'index.html';
    });

    if (typeof particlesJS !== 'undefined') {
        if (IS_MAIN_PAGE) particlesJS.load('particles-js', './assets/configs/particlesjs-config.json');
        else particlesJS.load('particles-js', './assets/configs/particlesjs-config.json');
    }
}

$(document).ready(() => init());