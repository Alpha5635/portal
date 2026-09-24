(function () {
  const client = window.portalApiClient;

  window.portalProfileApi = {
    get(studentId) {
      return client.get(`/api/students/${studentId}`);
    },
    update(studentId, payload) {
      return client.put(`/api/students/${studentId}`, payload);
    }
  };
})();
