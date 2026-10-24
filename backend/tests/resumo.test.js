const { prepararBanco, fecharBanco } = require("./banco");
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { iniciarServidor } = require("./ajudantes");
const Arquivo = require("../src/models/Arquivo");

describe("resumo do paciente", () => {
  let api;
  const cpf = "55566677788";

  before(async () => {
    await prepararBanco();
    api = await iniciarServidor();
  });

  after(async () => {
    await api.fechar();
    await fecharBanco();
  });

  test("responde 404 para paciente inexistente", async () => {
    const { status } = await api.chamar("GET", "/api/pacientes/00000000000/resumo");
    assert.equal(status, 404);
  });

  test("conta consultas, faltas, cancelamentos, procedimentos e exames", async () => {
    const { corpo: paciente } = await api.chamar("POST", "/api/pacientes", {
      cpf,
      patient: "Paciente Resumo",
    });

    const statusDasConsultas = ["realizada", "realizada", "faltou", "cancelada", "pendente"];
    for (const [indice, status] of statusDasConsultas.entries()) {
      const { corpo } = await api.chamar("POST", "/api/agendamentos", {
        cpf,
        patient: "Paciente Resumo",
        date: "2099-09-10",
        time: `1${indice}:00`,
      });
      await api.chamar("PATCH", `/api/agendamentos/${corpo.id}/status`, {
        status,
      });
    }

    const base = { cpf, tipo: "Limpeza" };
    await api.chamar("POST", "/api/procedimentos", {
      ...base,
      status: "realizado",
      data: "2026-09-10",
    });
    await api.chamar("POST", "/api/procedimentos", {
      ...base,
      status: "planejado",
    });

    const arquivo = {
      pacienteId: paciente.id,
      nome: "x.pdf",
      tipoMime: "application/pdf",
      tamanho: 1,
      caminho: "x.pdf",
    };
    await Arquivo.create({ ...arquivo, categoria: "exame" });
    await Arquivo.create({ ...arquivo, categoria: "documento" });

    const { status, corpo } = await api.chamar("GET", `/api/pacientes/${cpf}/resumo`);
    assert.equal(status, 200);
    assert.deepEqual(corpo, {
      consultas: 2,
      faltas: 1,
      cancelamentos: 1,
      procedimentos: 1,
      procedimentosPlanejados: 1,
      exames: 1,
    });
  });
});
