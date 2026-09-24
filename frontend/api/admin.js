(function () {
  const client = window.portalApiClient;

  window.portalAdminApi = {
    listApplicants() {
      return client.get('/api/admin/applications');
    },
    updateApplicationStatus(id, payload) {
      return client.put(`/api/admin/applications/${id}/status`, payload);
    },
    createOpportunity(payload) {
      return client.post('/api/admin/opportunities', payload);
    },
    updateOpportunity(id, payload) {
      return client.put(`/api/admin/opportunities/${id}`, payload);
    },
    deleteOpportunity(id) {
      return client.del(`/api/admin/opportunities/${id}`);
    }
  };
})();
