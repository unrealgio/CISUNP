const { prepararBanco, fecharBanco } = require("./banco");
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { iniciarServidor } = require("./ajudantes");

describe("status dos agendamentos (consultas)", () => {
  let api;
  let idCriado;

  before(async () => {
    await prepararBanco();
    api = await iniciarServidor();
  });

  after(async () => {
    await api.fechar();
    await fecharBanco();
  });

  const consulta = {
    time: "10:00",
    date: "2099-05-10",
    patient: "Carla Teste",
    cpf: "44455566677",
  };

  const buscarTodos = async () =>
    (await api.chamar("GET", "/api/agendamentos/todos")).corpo;

  test("agendamento novo começa como pendente", async () => {
    const { status, corpo } = await api.chamar(
      "POST",
      "/api/agendamentos",
      consulta,
    );
    assert.equal(status, 201);
    assert.equal(corpo.status, "pendente");
    idCriado = corpo.id;
  });

  test("muda o status para confirmada", async () => {
    const { status, corpo } = await api.chamar(
      "PATCH",
      `/api/agendamentos/${idCriado}/status`,
      { status: "confirmada" },
    );
    assert.equal(status, 200);
    assert.equal(corpo.status, "confirmada");
  });

  test("recusa status inválido com 400", async () => {
    const { status, corpo } = await api.chamar(
      "PATCH",
      `/api/agendamentos/${idCriado}/status`,
      { status: "atrasada" },
    );
    assert.equal(status, 400);
    assert.match(corpo.details[0], /Status deve ser/);
  });

  test("responde 404 para agendamento inexistente", async () => {
    const { status } = await api.chamar(
      "PATCH",
      "/api/agendamentos/999999/status",
      { status: "confirmada" },
    );
    assert.equal(status, 404);
  });

  test("cancelar libera o horário na agenda, no calendário e nos futuros", async () => {
    await api.chamar("PATCH", `/api/agendamentos/${idCriado}/status`, {
      status: "cancelada",
    });
    const doDia = await api.chamar("GET", "/api/agendamentos?date=2099-05-10");
    const dias = await api.chamar(
      "GET",
      "/api/agendamentos/dias?inicio=2099-05-01&fim=2099-05-31",
    );
    const futuros = await api.chamar(
      "GET",
      "/api/agendamentos/futuros?cpf=44455566677",
    );
    assert.deepEqual(doDia.corpo, []);
    assert.deepEqual(dias.corpo, []);
    assert.deepEqual(futuros.corpo, []);
  });

  test("permite novo agendamento no horário de uma consulta cancelada", async () => {
    const { status } = await api.chamar("POST", "/api/agendamentos", {
      ...consulta,
      patient: "Outra Pessoa",
      cpf: undefined,
    });
    assert.equal(status, 201);
  });

  test("reabrir a consulta cancelada num horário já ocupado responde 409", async () => {
    const { status, corpo } = await api.chamar(
      "PATCH",
      `/api/agendamentos/${idCriado}/status`,
      { status: "pendente" },
    );
    assert.equal(status, 409);
    assert.equal(corpo.error, "Já existe um agendamento neste horário.");
  });

  test("a lista de consultas inclui as canceladas", async () => {
    const todos = await buscarTodos();
    assert.deepEqual(todos.map((item) => item.status).sort(), [
      "cancelada",
      "pendente",
    ]);
  });

  test("excluir o paciente cancela só os agendamentos futuros em aberto", async () => {
    const futuro = await api.chamar("POST", "/api/agendamentos", {
      ...consulta,
      time: "11:00",
    });
    const passado = await api.chamar("POST", "/api/agendamentos", {
      ...consulta,
      date: "2020-01-15",
    });
    const realizado = await api.chamar("POST", "/api/agendamentos", {
      ...consulta,
      time: "12:00",
    });
    await api.chamar(
      "PATCH",
      `/api/agendamentos/${realizado.corpo.id}/status`,
      { status: "realizada" },
    );

    const exclusao = await api.chamar("DELETE", "/api/pacientes/44455566677");
    assert.equal(exclusao.status, 200);

    const porId = new Map((await buscarTodos()).map((item) => [item.id, item]));
    assert.equal(porId.get(futuro.corpo.id).status, "cancelada");
    assert.equal(porId.get(passado.corpo.id).status, "pendente");
    assert.equal(porId.get(realizado.corpo.id).status, "realizada");
  });
});
