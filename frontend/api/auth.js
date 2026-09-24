(function () {
  const client = window.portalApiClient;

  function saveToken(token, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(window.portalConfig.authStorageKey, token);
  }

  function clearToken() {
    sessionStorage.removeItem(window.portalConfig.authStorageKey);
    localStorage.removeItem(window.portalConfig.authStorageKey);
  }

  window.portalAuthApi = {
    saveToken,
    clearToken,
    register(payload) {
      return client.post('/api/auth/register', payload);
    },
    login(payload) {
      return client.post('/api/auth/login', payload);
    },
    logout() {
      clearToken();
      return Promise.resolve(true);
    },
    getCurrentUser() {
      return Promise.reject(new Error('The backend does not expose a current-user endpoint.'));
    }
  };
})();
