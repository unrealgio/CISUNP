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

// LÊ O E-MAIL DO USUÁRIO NA PARTE DO MEIO DO TOKEN (JWT), APENAS PARA EXIBIÇÃO
// A VALIDAÇÃO DO TOKEN CONTINUA SENDO FEITA PELO BACKEND
export function emailDoToken() {
  try {
    const payload = localStorage.getItem("token").split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json).email || null;
  } catch {
    return null;
  }
}

let pedirLogin = null;
let loginPendente = null;

export function registrarPedidoDeLogin(funcao) {
  pedirLogin = funcao;
}

function enviar(url, options) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem("token");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestUrl = url.startsWith("http") ? url : apiUrl(url);
  return fetch(requestUrl, { ...options, headers });
}

function sair() {
  localStorage.removeItem("token");
  window.location.replace("/");
}

// CENTRALIZA AS REQUISIÇÕES PARA A API
export async function apiFetch(url, options = {}) {
  const response = await enviar(url, options);

  // SESSÃO EXPIRADA: ESPERA O NOVO LOGIN NO MODAL E REENVIA A REQUISIÇÃO
  if (response.status === 401 && pedirLogin) {
    loginPendente ??= pedirLogin().finally(() => {
      loginPendente = null;
    });
    if (await loginPendente) return enviar(url, options);
    sair();
  } else if (response.status === 401 || response.status === 403) {
    sair();
  }

  return response;
}
