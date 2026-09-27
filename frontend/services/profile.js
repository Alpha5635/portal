(function () {
  const client = window.portalApiClient;

  window.portalProfileApi = {
    get(studentId) {
      return client.get(`/api/students/${studentId}`);
    },
    getByUserId(userId) {
      return client.get(`/api/students/by-user/${userId}`);
    },
    update(studentId, payload) {
      return client.put(`/api/students/${studentId}`, payload);
    }
  };
})();
