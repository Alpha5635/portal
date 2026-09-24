window.portalConfig = {
  apiBaseUrl: (window.__APP_CONFIG__ && window.__APP_CONFIG__.apiBaseUrl) || 'http://localhost:8081',
  authStorageKey: 'smartportal-auth-token'
};

window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
window.__APP_CONFIG__.apiBaseUrl = window.portalConfig.apiBaseUrl;
