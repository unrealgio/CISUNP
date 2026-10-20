const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { gerarTokenDeTeste, iniciarServidor } = require("./ajudantes");

describe("autenticação das rotas protegidas", () => {
  let servidor;

  before(async () => {
    servidor = await iniciarServidor();
  });

  after(() => servidor.fechar());

  async function buscarPacientes(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${servidor.url}/api/pacientes/todos`, {
      headers,
    });
    return { status: res.status, corpo: await res.json() };
  }

  test("sem token responde 401", async () => {
    const { status, corpo } = await buscarPacientes();
    assert.equal(status, 401);
    assert.equal(corpo.error, "Token não fornecido");
  });

  test("token inválido responde 401", async () => {
    const { status, corpo } = await buscarPacientes("abc");
    assert.equal(status, 401);
    assert.equal(corpo.error, "Sessão expirada ou inválida.");
  });

  test("token vencido responde 401", async () => {
    const umMinutoAtras = Math.floor(Date.now() / 1000) - 60;
    const token = gerarTokenDeTeste({ exp: umMinutoAtras }, {});
    const { status } = await buscarPacientes(token);
    assert.equal(status, 401);
  });

  test("token do primeiro acesso responde 403", async () => {
    const token = gerarTokenDeTeste({ trocarSenha: true });
    const { status, corpo } = await buscarPacientes(token);
    assert.equal(status, 403);
    assert.equal(corpo.error, "Troque a senha para continuar.");
  });

  test("token do primeiro acesso é aceito na troca de senha", async () => {
    const token = gerarTokenDeTeste({ trocarSenha: true });
    const res = await fetch(`${servidor.url}/api/change-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const corpo = await res.json();
    assert.equal(res.status, 400);
    assert.ok(corpo.details.includes("Informe a senha atual."));
  });
});
