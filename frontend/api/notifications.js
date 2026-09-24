(function () {
  const client = window.portalApiClient;

  window.portalNotificationsApi = {
    list() {
      return Promise.reject(new Error('The backend does not expose notifications endpoints.'));
    },
    markRead() {
      return Promise.reject(new Error('The backend does not expose notifications endpoints.'));
    }
  };
})();
