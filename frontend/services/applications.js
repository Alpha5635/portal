(function () {
  const client = window.portalApiClient;

  window.portalApplicationsApi = {
    list(studentId) {
      return client.get(`/api/applications/student/${studentId}`);
    },
    getById(id) {
      return client.get(`/api/applications/${id}`);
    }
  };
})();
