
// --- CONFIGURATION ---
const APP_STORE_URL = "https://apps.apple.com/app/brain-it-on/id985367692";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.orbital.brainiton";
const UNIVERSAL_LINK_BASE = "https://orbitalnine.com";
const LANDING_PAGE = "https://orbitalnine.com";
const REDIRECT_TIMEOUT = 2200;
const FALLBACK_MESSAGE = "Couldn't open the app automatically.<br>Try one of the options below:";

// --- DOM ELEMENTS ---
const spinner = document.getElementById('spinner');
const actions = document.getElementById('actions');
const openAppBtn = document.getElementById('open-app-btn');
const getAppBtn = document.getElementById('get-app-btn');
const qrSection = document.getElementById('qr-section');
const subtitle = document.getElementById('subtitle');

// --- TESTING ---
const isTesting = false; // disable redirect

// --- HELPER FUNCTIONS ---
function isBioLink(path) {
  return /^\/bio\//.test(path);
}

function getStoreUrl() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(ua)) return PLAY_STORE_URL;
  if (/iPad|iPhone|iPod|Macintosh/.test(ua) && !window.MSStream) return APP_STORE_URL;
  return LANDING_PAGE;
}

function getUniversalLink(path) {
  return UNIVERSAL_LINK_BASE + path + window.location.search + window.location.hash;
}

function getDeepLink() {
  return window.location.href.replace(/^https:\/\/(www\.)?orbitalnine\.com\/bio\//, 'brainiton://');
}

function isMobile() {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isDesktop() {
  return !isMobile();
}

function isIOSChrome() {
  const ua = navigator.userAgent;
  return /CriOS/i.test(ua) && /iphone|ipad|ipod/i.test(ua);
}

function isIOSSafari() {
  const ua = navigator.userAgent;
  return /iP(hone|od|ad)/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
}

function showFallbackUI() {
    spinner.style.display = "none";
    actions.style.display = "block";
    subtitle.innerHTML = FALLBACK_MESSAGE;
}

// --- MAIN LOGIC ---
function handlePageLogic() {
    const path = window.location.pathname;

    if (!isTesting &&!isBioLink(path)) {
        window.location.href = LANDING_PAGE;
        return;
    }

    const deepLink = getDeepLink();
    const storeUrl = getStoreUrl();
    const universalLink = getUniversalLink(path);
    const redirectKey = 'bio_redirect_attempted_' + path;
    const hasRedirected = sessionStorage.getItem(redirectKey);

    openAppBtn.href = deepLink;
    getAppBtn.href = storeUrl;

    openAppBtn.onclick = function(e) {
        if (isMobile()) {
            e.preventDefault();
            window.location.href = getDeepLink();
        }
    };

    if (isDesktop()) {
        openAppBtn.style.display = 'none';
        subtitle.innerHTML = "This page is for opening Brain It On! on your phone.<br>Scan the QR code below or copy the link.";
        actions.style.display = "block";
        qrSection.classList.add("visible");
        new QRious({
            element: document.getElementById('qr-code'),
            value: universalLink,
            size: 160,
            background: "#fff",
            foreground: "#6750a4"
        });
        return;
    }

    // --- Mobile device logic ---
    if (hasRedirected) {
        showFallbackUI();
        return;
    }
    
    sessionStorage.setItem(redirectKey, '1');
    spinner.style.display = "block";

    // Special handling for iOS Safari & Chrome, which don't reliably redirect to the store.
    if (isIOSSafari() || isIOSChrome()) {
        window.location.href = deepLink;
        setTimeout(showFallbackUI, REDIRECT_TIMEOUT);
    } else { // Other mobile browsers
        // Try to open the app via deep link.
        window.location.href = deepLink;
        setTimeout(showFallbackUI, REDIRECT_TIMEOUT);
        setTimeout(function() {
            window.location.href = storeUrl;
        }, REDIRECT_TIMEOUT);
    }
}

handlePageLogic();
