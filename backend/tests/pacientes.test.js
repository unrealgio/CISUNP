const { prepararBanco, fecharBanco } = require("./banco");
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { iniciarServidor } = require("./ajudantes");
const Paciente = require("../src/models/Paciente");

describe("pacientes", () => {
  let api;

  before(async () => {
    await prepararBanco();
    api = await iniciarServidor();
  });

  after(async () => {
    await api.fechar();
    await fecharBanco();
  });

  const paciente = {
    cpf: "11122233344",
    patient: "  Maria Teste  ",
    phone: "84999990000",
    idade: "30",
  };

  test("cria um paciente com 201 e remove espaços do nome", async () => {
    const { status, corpo } = await api.chamar(
      "POST",
      "/api/pacientes",
      paciente,
    );
    assert.equal(status, 201);
    assert.equal(corpo.patient, "Maria Teste");
    assert.equal(corpo.idade, 30);
  });

  test("recusa CPF já cadastrado com 409", async () => {
    const { status, corpo } = await api.chamar(
      "POST",
      "/api/pacientes",
      paciente,
    );
    assert.equal(status, 409);
    assert.equal(corpo.error, "Já existe um paciente com este CPF.");
  });

  test("busca o paciente pelo CPF", async () => {
    const { status, corpo } = await api.chamar(
      "GET",
      "/api/pacientes/11122233344",
    );
    assert.equal(status, 200);
    assert.equal(corpo.phone, "84999990000");
  });

  test("busca sugestões por parte do nome, sem diferenciar maiúsculas", async () => {
    await api.chamar("POST", "/api/pacientes", {
      cpf: "22233344455",
      patient: "Mariana Souza",
    });
    const { status, corpo } = await api.chamar(
      "GET",
      "/api/pacientes/busca?q=MARI",
    );
    assert.equal(status, 200);
    assert.deepEqual(
      corpo.map((p) => p.patient),
      ["Maria Teste", "Mariana Souza"],
    );
  });

  test("busca sugestões pelo início do CPF", async () => {
    const { corpo } = await api.chamar("GET", "/api/pacientes/busca?q=222");
    assert.deepEqual(
      corpo.map((p) => p.cpf),
      ["22233344455"],
    );
  });

  test("busca trata % e _ como texto comum", async () => {
    const { corpo } = await api.chamar("GET", "/api/pacientes/busca?q=%25%25");
    assert.deepEqual(corpo, []);
  });

  test("busca exige pelo menos 2 caracteres", async () => {
    const { status } = await api.chamar("GET", "/api/pacientes/busca?q=a");
    assert.equal(status, 400);
  });

  test("responde 404 para CPF não cadastrado", async () => {
    const { status } = await api.chamar("GET", "/api/pacientes/99999999999");
    assert.equal(status, 404);
  });

  test("atualiza o paciente e transforma idade vazia em null", async () => {
    const { status, corpo } = await api.chamar(
      "PUT",
      "/api/pacientes/11122233344",
      { patient: "Maria Atualizada", idade: "" },
    );
    assert.equal(status, 200);
    assert.equal(corpo.patient, "Maria Atualizada");
    assert.equal(corpo.idade, null);
  });

  test("exclui o paciente e responde 404 se excluir de novo", async () => {
    const primeira = await api.chamar("DELETE", "/api/pacientes/11122233344");
    assert.equal(primeira.status, 200);
    const segunda = await api.chamar("DELETE", "/api/pacientes/11122233344");
    assert.equal(segunda.status, 404);
  });

  test("paciente excluído some da busca e da lista", async () => {
    const busca = await api.chamar("GET", "/api/pacientes/11122233344");
    assert.equal(busca.status, 404);
    const lista = await api.chamar("GET", "/api/pacientes/todos");
    assert.ok(!lista.corpo.some((item) => item.cpf === "11122233344"));
  });

  test("o registro continua no banco com a data da exclusão", async () => {
    const registro = await Paciente.findOne({
      where: { cpf: "11122233344" },
      paranoid: false,
    });
    assert.ok(registro.deletedAt instanceof Date);
  });

  test("recadastrar o CPF reativa o paciente com os dados novos", async () => {
    const { status, corpo } = await api.chamar("POST", "/api/pacientes", {
      cpf: "11122233344",
      patient: "Maria Voltou",
    });
    assert.equal(status, 201);
    assert.equal(corpo.patient, "Maria Voltou");
    assert.equal(corpo.deletedAt, null);
    const busca = await api.chamar("GET", "/api/pacientes/11122233344");
    assert.equal(busca.status, 200);
  });
});
