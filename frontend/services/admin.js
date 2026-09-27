(function () {
  const client = window.portalApiClient;

  window.portalAdminApi = {
    listStudents() {
      return client.get('/api/admin/students');
    },
    listCompanies() {
      return client.get('/api/admin/companies');
    },
    listJobs() {
      return client.get('/api/admin/jobs');
    },
    listApplicants() {
      return client.get('/api/admin/applications');
    },
    dashboard() {
      return client.get('/api/admin/dashboard');
    }
  };
})();
