const { prepararBanco, fecharBanco } = require("./banco");
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { iniciarServidor } = require("./ajudantes");

describe("agendamentos", () => {
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

  const agendamento = {
    time: "09:00",
    date: "2099-03-15",
    patient: "João Teste",
    cpf: "55566677788",
    phone: "84988880000",
    medico: "Dra. Ana",
  };

  test("cria um agendamento com 201", async () => {
    const { status, corpo } = await api.chamar(
      "POST",
      "/api/agendamentos",
      agendamento,
    );
    assert.equal(status, 201);
    assert.ok(corpo.id);
    idCriado = corpo.id;
  });

  test("recusa outro agendamento no mesmo horário com 409", async () => {
    const { status, corpo } = await api.chamar("POST", "/api/agendamentos", {
      ...agendamento,
      patient: "Outra Pessoa",
      cpf: undefined,
    });
    assert.equal(status, 409);
    assert.equal(corpo.error, "Já existe um agendamento neste horário.");
  });

  test("cadastra o paciente automaticamente pelo CPF do agendamento", async () => {
    const { status, corpo } = await api.chamar(
      "GET",
      "/api/pacientes/55566677788",
    );
    assert.equal(status, 200);
    assert.equal(corpo.patient, "João Teste");
    assert.equal(corpo.medico, "Dra. Ana");
  });

  test("lista os agendamentos da data", async () => {
    const { status, corpo } = await api.chamar(
      "GET",
      "/api/agendamentos?date=2099-03-15",
    );
    assert.equal(status, 200);
    assert.deepEqual(
      corpo.map((item) => item.time),
      ["09:00"],
    );
  });

  test("lista os dias com agendamento no intervalo", async () => {
    const { corpo } = await api.chamar(
      "GET",
      "/api/agendamentos/dias?inicio=2099-03-01&fim=2099-03-31",
    );
    assert.deepEqual(corpo, ["2099-03-15"]);
  });

  test("lista os agendamentos futuros do paciente", async () => {
    const { corpo } = await api.chamar(
      "GET",
      "/api/agendamentos/futuros?cpf=55566677788",
    );
    assert.equal(corpo.length, 1);
    assert.equal(corpo[0].id, idCriado);
  });

  test("atualiza o agendamento", async () => {
    const { status, corpo } = await api.chamar(
      "PUT",
      `/api/agendamentos/${idCriado}`,
      { ...agendamento, notes: "Trazer exames" },
    );
    assert.equal(status, 200);
    assert.equal(corpo.notes, "Trazer exames");
  });

  test("responde 404 ao atualizar agendamento inexistente", async () => {
    const { status } = await api.chamar(
      "PUT",
      "/api/agendamentos/999999",
      agendamento,
    );
    assert.equal(status, 404);
  });

  test("exclui o agendamento e responde 404 se excluir de novo", async () => {
    const primeira = await api.chamar(
      "DELETE",
      `/api/agendamentos/${idCriado}`,
    );
    assert.equal(primeira.status, 200);
    const segunda = await api.chamar("DELETE", `/api/agendamentos/${idCriado}`);
    assert.equal(segunda.status, 404);
  });

  test("agendar para o CPF de um paciente excluído reativa o paciente", async () => {
    await api.chamar("DELETE", "/api/pacientes/55566677788");
    const { status } = await api.chamar("POST", "/api/agendamentos", {
      ...agendamento,
      time: "10:00",
    });
    assert.equal(status, 201);
    const busca = await api.chamar("GET", "/api/pacientes/55566677788");
    assert.equal(busca.status, 200);
  });

  test("agendar com CPF já cadastrado atualiza nome e telefone, mas não troca o médico", async () => {
    await api.chamar("POST", "/api/agendamentos", {
      ...agendamento,
      time: "11:00",
      patient: "João Atualizado",
      phone: "84977770000",
      medico: "Dr. Bruno",
    });
    const { corpo } = await api.chamar("GET", "/api/pacientes/55566677788");
    assert.equal(corpo.patient, "João Atualizado");
    assert.equal(corpo.phone, "84977770000");
    assert.equal(corpo.medico, "Dra. Ana");
  });

  test("telefone vazio na agenda não apaga o telefone do cadastro", async () => {
    await api.chamar("POST", "/api/agendamentos", {
      ...agendamento,
      time: "11:30",
      patient: "João Atualizado",
      phone: "",
    });
    const { corpo } = await api.chamar("GET", "/api/pacientes/55566677788");
    assert.equal(corpo.phone, "84977770000");
  });

  test("corrigir o nome no cadastro muda o nome em todas as consultas", async () => {
    await api.chamar("PUT", "/api/pacientes/55566677788", {
      patient: "João Corrigido",
    });
    const { corpo } = await api.chamar(
      "GET",
      "/api/agendamentos?date=2099-03-15",
    );
    assert.ok(corpo.length >= 3);
    for (const item of corpo) {
      assert.equal(item.patient, "João Corrigido");
      assert.equal(item.cpf, "55566677788");
    }
  });

  test("agendamento sem CPF é avulso: guarda nome e telefone e não cria paciente", async () => {
    const { status, corpo } = await api.chamar("POST", "/api/agendamentos", {
      time: "12:30",
      date: "2099-03-16",
      patient: "Visitante Avulso",
      phone: "84900000000",
      cpf: "",
    });
    assert.equal(status, 201);
    assert.equal(corpo.pacienteId, null);
    assert.equal(corpo.cpf, null);
    assert.equal(corpo.patient, "Visitante Avulso");
    assert.equal(corpo.phone, "84900000000");

    const lista = await api.chamar("GET", "/api/pacientes/todos");
    assert.ok(!lista.corpo.some((p) => p.patient === "Visitante Avulso"));
  });
});
