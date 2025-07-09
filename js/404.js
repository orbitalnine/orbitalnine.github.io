
// Store links from your current 404 page
const APP_STORE_URL = "https://apps.apple.com/app/brain-it-on/id985367692";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.orbital.brainiton";
const UNIVERSAL_LINK_BASE = "https://orbitalnine.com";
const LANDING_PAGE = "https://orbitalnine.com";

// Helper functions
function isBioLink(path) {
  return /^\/bio\//.test(path);
}
function getStoreUrl() {
  var ua = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(ua)) return PLAY_STORE_URL;
  if (/iPad|iPhone|iPod|Macintosh/.test(ua) && !window.MSStream) return APP_STORE_URL;
  return LANDING_PAGE;
}
function getUniversalLink(path) {
  const url= UNIVERSAL_LINK_BASE + path + window.location.search + window.location.hash;
  return url;
}
function getDeepLink() {
  // Build the deep link from the current universal link
  let url = window.location.href;
  url = url.replace(/^https:\/\/(www\.)?orbitalnine\.com\/bio\//, 'brainiton://');
  return url;
}
function isMobile() {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isDesktop() {
  return !isMobile();
}
// iOS Chrome deep link/store fallback fix
function isIOSChrome() {
  var ua = navigator.userAgent;
  return /CriOS/i.test(ua) && /iphone|ipad|ipod/i.test(ua);
}
function isIOSSafari() {
  var ua = navigator.userAgent;
  return /iP(hone|od|ad)/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
}

// Main logic
const path = window.location.pathname;
const spinner = document.getElementById('spinner');
const actions = document.getElementById('actions');
const openAppBtn = document.getElementById('open-app-btn');
const getAppBtn = document.getElementById('get-app-btn');
const qrSection = document.getElementById('qr-section');
const subtitle = document.getElementById('subtitle');

// --- iOS Safari special handling ---
if (isIOSSafari() && isBioLink(path)) {
  const redirectKey = 'bio_redirect_attempted_' + path;
  const hasRedirected = sessionStorage.getItem(redirectKey);
  const deepLink = getDeepLink();
  if (!hasRedirected) {
    sessionStorage.setItem(redirectKey, '1');
    spinner.style.display = "block";
    // Try to open the app immediately (no delay)
    window.location = deepLink;
    // After 2.2s, show fallback UI only (do NOT redirect to store)
    setTimeout(function() {
      spinner.style.display = "none";
      actions.style.display = "block";
      subtitle.innerHTML = "Couldn't open the app automatically.<br>Try one of the options below:";
    }, 2200);
  } else {
    spinner.style.display = "none";
    actions.style.display = "block";
    subtitle.innerHTML = "Couldn't open the app automatically.<br>Try one of the options below:";
  }
  // Do not return, allow rest of script to run for fallback
} else if (isIOSChrome() && isBioLink(path)) {
  const redirectKey = 'bio_redirect_attempted_' + path;
  const hasRedirected = sessionStorage.getItem(redirectKey);
  const deepLink = getDeepLink();
  if (!hasRedirected) {
    sessionStorage.setItem(redirectKey, '1');
    spinner.style.display = "block";
    // Try to open the app immediately (no delay)
    window.location = deepLink;
    setTimeout(function() {
      spinner.style.display = "none";
      actions.style.display = "block";
      subtitle.innerHTML = "Couldn't open the app automatically.<br>Try one of the options below:";
    }, 2200);
  } else {
    spinner.style.display = "none";
    actions.style.display = "block";
    subtitle.innerHTML = "Couldn't open the app automatically.<br>Try one of the options below:";
  }
  // Do not return, allow rest of script to run for fallback
} else if (isBioLink(path)) {
  const universalLink = getUniversalLink(path);
  const storeUrl = getStoreUrl();
  const deepLink = getDeepLink();

  openAppBtn.href = deepLink;
  getAppBtn.href = storeUrl;

  // Add click handler to 'Open in App' button to retry opening the app on mobile
  openAppBtn.onclick = function(e) {
    if (isMobile()) {
      e.preventDefault();
      window.location = getDeepLink();
    }
  };

  // Prevent redirect loop: only allow one redirect per session
  const redirectKey = 'bio_redirect_attempted_' + path;
  const hasRedirected = sessionStorage.getItem(redirectKey);

  if (isDesktop()) {
    subtitle.innerHTML = "This page is for opening Brain It On! on your phone.<br>Scan the QR code below or copy the link.";
    actions.style.display = "block";
    qrSection.classList.add("visible");
    // Generate QR code
    new QRious({
      element: document.getElementById('qr-code'),
      value: universalLink,
      size: 160,
      background: "#fff",
      foreground: "#6750a4"
    });
  } else {
    if (!hasRedirected) {
      // Mobile: try to open app, fallback to store
      sessionStorage.setItem(redirectKey, '1');
      spinner.style.display = "block";
      setTimeout(function() {
        // Show fallback buttons if app not opened
        spinner.style.display = "none";
        actions.style.display = "block";
        subtitle.innerHTML = "Couldn't open the app automatically.<br>Try one of the options below:";
      }, 2200);

      // Try to open the app via universal link
      window.location = deepLink;

      // Fallback to store after 2.2s if still on page
      setTimeout(function() {
        window.location = storeUrl;
      }, 2200);
    } else {
      // Already attempted redirect, show fallback only
      spinner.style.display = "none";
      actions.style.display = "block";
      subtitle.innerHTML = "Couldn't open the app automatically.<br>Try one of the options below:";
    }
  }
} else {
  // Not a /bio/ link: redirect to landing page
  window.location = LANDING_PAGE;
}
