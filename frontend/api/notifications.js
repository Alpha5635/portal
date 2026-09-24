(function () {
  const client = window.portalApiClient;

  window.portalNotificationsApi = {
    list() {
      return client.get('/api/notifications');
    },
    markRead(id) {
      return client.put(`/api/notifications/${id}/read`);
    }
  };
})();
