(function () {
  const config = window.portalConfig || { apiBaseUrl: 'http://localhost:8080', authStorageKey: 'smartportal-auth-token' };

  function getToken() {
    return sessionStorage.getItem(config.authStorageKey) || localStorage.getItem(config.authStorageKey) || '';
  }

  function buildUrl(path) {
    const base = (config.apiBaseUrl || 'http://localhost:8080').replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  function getHeaders(headers = {}) {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async function request(method, path, payload, options = {}) {
    const url = buildUrl(path);
    const response = await fetch(url, {
      method,
      headers: getHeaders(options.headers || {}),
      body: payload !== undefined && payload !== null ? JSON.stringify(payload) : undefined
    });

    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }

    if (response.status === 403) {
      throw new Error('Forbidden. You do not have access to this resource.');
    }

    if (response.status === 404) {
      throw new Error(`MISSING BACKEND ENDPOINT: ${path}`);
    }

    if (response.status === 204 || response.status === 205) {
      return null;
    }

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      data = text;
    }

    if (!response.ok) {
      const message = (data && data.message) || (data && data.error) || 'Request failed.';
      throw new Error(message);
    }

    return data;
  }

  function get(path, options = {}) {
    return request('GET', path, undefined, options);
  }

  function post(path, payload, options = {}) {
    return request('POST', path, payload, options);
  }

  function put(path, payload, options = {}) {
    return request('PUT', path, payload, options);
  }

  function del(path, options = {}) {
    return request('DELETE', path, undefined, options);
  }

  window.portalApiClient = {
    config,
    buildUrl,
    getToken,
    getHeaders,
    get,
    post,
    put,
    del,
    request
  };
})();
