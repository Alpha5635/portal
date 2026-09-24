(function () {
  const client = window.portalApiClient;

  window.portalApplicationsApi = {
    list() {
      return client.get('/api/applications');
    },
    getById(id) {
      return client.get(`/api/applications/${id}`);
    }
  };
})();
