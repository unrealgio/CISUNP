// BASE URL DA API
const API_URL = import.meta.env.VITE_API_URL;

// FUNÇÃO AUXILIAR PARA CONSTRUIR URLS DA API
export function apiUrl(path) {
  return `${API_URL}${path}`;
}

// CENTRALIZA AS REQUISIÇÕES PARA A API
export function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem("token");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestUrl = url.startsWith("http") ? url : apiUrl(url);

  return fetch(requestUrl, { ...options, headers }).then((response) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      window.location.replace("/");
    }

    return response;
  });
}
