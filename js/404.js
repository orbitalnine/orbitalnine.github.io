
// --- CONFIGURATION ---
const APP_STORE_URL = "https://apps.apple.com/app/brain-it-on/id985367692";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.orbital.brainiton";
const UNIVERSAL_LINK_BASE = "https://orbitalnine.com";
const HOMEPAGE = "https://orbitalnine.com";
const REDIRECT_TIMEOUT = 2200;
const FALLBACK_MESSAGE = "Couldn't open the app automatically.<br>Try one of the options below:";

// --- DOM ELEMENTS ---
const spinner = document.getElementById('spinner');
const actions = document.getElementById('actions');
const openAppBtn = document.getElementById('open-app-btn');
const getAppBtn = document.getElementById('get-app-btn');
const qrSection = document.getElementById('qr-section');
const subtitle = document.getElementById('subtitle');
const pathContainer = document.getElementById('path-container');
const pathDisplay = document.getElementById('path-display');
const copyBtn = document.getElementById('copy-btn');
const copyMsg = document.getElementById('copy-msg');

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
  return HOMEPAGE;
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

    let path;
    if (isTesting) {
        path = "/bio/s?message=abc";
    } else {
        path = window.location.pathname;
    }

    if (!isBioLink(path)) {
        window.location.href = HOMEPAGE;
        return;
    }

    const deepLink = getDeepLink();
    const storeUrl = getStoreUrl();
    const universalLink = getUniversalLink(path);

    if (pathContainer) {
        pathDisplay.textContent = universalLink;
        pathContainer.style.display = 'block';
        copyBtn.addEventListener('click', function() {
            const successCallback = function() {
                const originalText = pathDisplay.textContent;
                pathDisplay.textContent = 'Copied!';
                pathDisplay.classList.add('flash-animation');
                setTimeout(function() {
                    pathDisplay.textContent = originalText;
                    pathDisplay.classList.remove('flash-animation');
                }, 1000);
            };

            const fallback = function() {
                var textArea = document.createElement("textarea");
                textArea.value = universalLink;
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    var successful = document.execCommand('copy');
                    if (successful) {
                        successCallback();
                    }
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                }
                document.body.removeChild(textArea);
            };

            if (!navigator.clipboard) {
                fallback();
                return;
            }
            navigator.clipboard.writeText(universalLink).then(successCallback, function(err) {
                console.error('Could not copy text, trying fallback: ', err);
                fallback();
            });
        });
    }

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
        subtitle.innerHTML = "This page is for opening the game on your phone.<br>Scan the QR code below or copy the link.";
        actions.style.display = "block";
        getAppBtn.classList.remove('secondary');
        qrSection.classList.add("visible");
        new QRious({
            element: document.getElementById('qr-code'),
            value: universalLink,
            size: 160,
            background: "#fff",
            foreground: "#000"
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

    window.location.href = deepLink;
    setTimeout(showFallbackUI, REDIRECT_TIMEOUT);
}

handlePageLogic();
