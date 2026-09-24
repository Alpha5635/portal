(function () {
  const client = window.portalApiClient;

  window.portalOpportunitiesApi = {
    list(params = {}) {
      const query = new URLSearchParams(params).toString();
      return client.get(`/api/opportunities${query ? `?${query}` : ''}`);
    },
    getById(id) {
      return client.get(`/api/opportunities/${id}`);
    },
    apply(id, payload = {}) {
      return client.post(`/api/opportunities/${id}/apply`, payload);
    }
  };
})();
