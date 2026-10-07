// BASE URL DA API
const API_URL = import.meta.env.VITE_API_URL;

// FUNÇÃO AUXILIAR PARA CONSTRUIR URLS DA API
export function apiUrl(path) {
  return `${API_URL}${path}`;
}

// MONTA A MENSAGEM DE ERRO DE UMA RESPOSTA DA API
// (MOTIVOS DA VALIDAÇÃO EM "details", SENÃO O "error", SENÃO O TEXTO PADRÃO)
export function mensagemDeErro(data, padrao) {
  return data?.details?.join(" ") || data?.error || padrao;
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
