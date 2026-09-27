const isLocalDev = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port !== '80' && window.location.port !== '443' && !window.location.hostname.includes('vercel.app');

window.portalConfig = {
  apiBaseUrl: (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiBaseUrl) || 
    (isLocalDev ? 'http://localhost:8081' : ''),
  authStorageKey: 'smartportal-auth-token'
};

window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
window.__APP_CONFIG__.apiBaseUrl = window.portalConfig.apiBaseUrl;
