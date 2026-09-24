(function () {
  const client = window.portalApiClient;

  window.portalProfileApi = {
    get() {
      return client.get('/api/profile');
    },
    update(payload) {
      return client.put('/api/profile', payload);
    }
  };
})();
