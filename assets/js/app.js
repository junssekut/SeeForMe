const WINDOW_PATH = window.location.pathname;
const IS_MAIN_PAGE = WINDOW_PATH.includes('index.html') || WINDOW_PATH === '' || WINDOW_PATH === '/';
const IS_MOBILE = window.innerWidth <= 768;

function speakText(text) {
    // let utterance = new SpeechSynthesisUtterance(text);
  
    // utterance.lang = 'en-US';
    // utterance.volume = 1;
    // utterance.rate = 1;
    // utterance.pitch = 1;
  
    // window.speechSynthesis.speak(utterance);
    
    responsiveVoice.speak(text);
}

function vibrateDevice() {
    if (navigator.vibrate) {
        navigator.vibrate(500);
    } else {
        console.log('Vibration API not supported on this device.');
    }
  }
    
function sendNotification(message) {
    new Notify ({
        status: 'info',
        title: '',
        text: message,
        effect: 'fade',
        speed: 3000,
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
}

function init() {
    if (IS_MAIN_PAGE) {
        sendNotification(`
            ${IS_MOBILE ? `Swipe left` :
                `Press space`
            }  and say 'See For Me' to make me describe things around you!
        `);

        speakText(`
            ${IS_MOBILE ? `Welcome to See for Me! Swipe left or click the scanner icon to open the camera.` :
                `Welcome to See for Me! Press the space key or click the scanner icon to open the camera.`
            }    
        `)
    } else {
        sendNotification(`
            Voice activate with 'See For Me'!
        `);

        speakText(`
            ${IS_MOBILE ? `When you're ready, just say, 'See for me,' and I'll guide you by describing the objects around you.` :
                `When you're ready, just say, 'See for me,' and I'll guide you by describing the objects around you.`
            }    
        `)
    }

// Mobile: "Welcome to See for Me! Swipe left or click the scanner icon to open the camera. When you're ready, just say, 'See for me,' and I'll guide you by describing the objects around you."

// Web: "Welcome to See for Me! Press the space key or click the scanner icon to open the camera. When you're ready, just say, 'See for me,' and I'll guide you by describing the objects around you."

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

            // if (touchEndX < touchStartX - 50 && IS_MAIN_PAGE) window.location.href = 'seeforme.html'; 
            // if (touchEndX > touchStartX + 50 && !IS_MAIN_PAGE) window.location.href = 'index.html';
            
            // vibrateDevice();
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