(function () {
  const client = window.portalApiClient;

  window.portalOpportunitiesApi = {
    list(params = {}) {
      const query = new URLSearchParams(params).toString();
      return client.get(`/api/jobs${query ? `?${query}` : ''}`);
    },
    getById(id) {
      return client.get(`/api/jobs/${id}`);
    },
    apply(id, payload = {}) {
      return client.post('/api/applications', { studentId: payload.studentId, jobId: id });
    }
  };
})();
