const { prepararBanco, fecharBanco } = require("./banco");
const os = require("os");
const path = require("path");
const fs = require("fs");

process.env.PASTA_ARQUIVOS = fs.mkdtempSync(
  path.join(os.tmpdir(), "cis-arquivos-"),
);

const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { iniciarServidor, gerarTokenDeTeste } = require("./ajudantes");

describe("arquivos do paciente", () => {
  let api;
  let idEnviado;
  const conteudo = Buffer.from("%PDF-1.4 arquivo de teste");

  before(async () => {
    await prepararBanco();
    api = await iniciarServidor();
  });

  after(async () => {
    await api.fechar();
    await fecharBanco();
    fs.rmSync(process.env.PASTA_ARQUIVOS, { recursive: true, force: true });
  });

  function enviar(corpo, tipo, consulta) {
    const parametros = new URLSearchParams({
      cpf: "12312312312",
      categoria: "exame",
      nome: "Radiografia panorâmica.pdf",
      ...consulta,
    });
    return fetch(`${api.url}/api/arquivos?${parametros}`, {
      method: "POST",
      headers: {
        "Content-Type": tipo,
        Authorization: `Bearer ${gerarTokenDeTeste()}`,
      },
      body: corpo,
    });
  }

  test("envia um PDF com 201 e não expõe o caminho no disco", async () => {
    const res = await enviar(conteudo, "application/pdf");
    const corpo = await res.json();
    assert.equal(res.status, 201);
    assert.equal(corpo.nome, "Radiografia panorâmica.pdf");
    assert.equal(corpo.categoria, "exame");
    assert.equal(corpo.tamanho, conteudo.length);
    assert.equal(corpo.caminho, undefined);
    idEnviado = corpo.id;
  });

  test("recusa tipo de arquivo não permitido", async () => {
    const res = await enviar("texto", "text/plain");
    const corpo = await res.json();
    assert.equal(res.status, 400);
    assert.deepEqual(corpo.details, [
      "Envie um PDF ou uma imagem (PNG, JPG ou WEBP).",
    ]);
  });

  test("recusa categoria inválida", async () => {
    const res = await enviar(conteudo, "application/pdf", {
      categoria: "foto",
    });
    assert.equal(res.status, 400);
  });

  test("recusa arquivo maior que 10 MB com 413", async () => {
    const grande = Buffer.alloc(10 * 1024 * 1024 + 1);
    const res = await enviar(grande, "image/png");
    const corpo = await res.json();
    assert.equal(res.status, 413);
    assert.equal(corpo.error, "O arquivo deve ter no máximo 10 MB.");
  });

  test("lista os arquivos do paciente sem o caminho", async () => {
    const { status, corpo } = await api.chamar(
      "GET",
      "/api/arquivos?cpf=12312312312",
    );
    assert.equal(status, 200);
    assert.equal(corpo.length, 1);
    assert.equal(corpo[0].caminho, undefined);
  });

  test("baixa o mesmo conteúdo que foi enviado", async () => {
    const res = await fetch(`${api.url}/api/arquivos/${idEnviado}/download`, {
      headers: { Authorization: `Bearer ${gerarTokenDeTeste()}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "application/pdf");
    assert.deepEqual(Buffer.from(await res.arrayBuffer()), conteudo);
  });

  test("download exige autenticação", async () => {
    const res = await fetch(`${api.url}/api/arquivos/${idEnviado}/download`);
    assert.equal(res.status, 401);
  });

  test("excluir remove o registro e o arquivo do disco", async () => {
    const pasta = path.join(process.env.PASTA_ARQUIVOS, "12312312312");
    assert.equal(fs.readdirSync(pasta).length, 1);

    const { status } = await api.chamar("DELETE", `/api/arquivos/${idEnviado}`);
    assert.equal(status, 200);
    assert.equal(fs.readdirSync(pasta).length, 0);

    const download = await api.chamar(
      "GET",
      `/api/arquivos/${idEnviado}/download`,
    );
    assert.equal(download.status, 404);
  });
});
