const { prepararBanco, fecharBanco } = require("./banco");
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { iniciarServidor } = require("./ajudantes");

describe("procedimentos", () => {
  let api;
  let idPlanejado;

  before(async () => {
    await prepararBanco();
    api = await iniciarServidor();
    for (const cpf of ["12312312312", "99999999999"]) {
      await api.chamar("POST", "/api/pacientes", { cpf, patient: "Teste" });
    }
  });

  after(async () => {
    await api.fechar();
    await fecharBanco();
  });

  const procedimento = {
    cpf: "12312312312",
    tipo: "Restauração",
    dente: "36",
    status: "planejado",
  };

  test("adiciona um procedimento planejado com 201", async () => {
    const { status, corpo } = await api.chamar(
      "POST",
      "/api/procedimentos",
      procedimento,
    );
    assert.equal(status, 201);
    assert.equal(corpo.tipo, "Restauração");
    assert.equal(corpo.status, "planejado");
    assert.equal(corpo.data, null);
    idPlanejado = corpo.id;
  });

  test("recusa procedimento para CPF sem cadastro com 404", async () => {
    const { status } = await api.chamar("POST", "/api/procedimentos", {
      ...procedimento,
      cpf: "00000000000",
    });
    assert.equal(status, 404);
  });

  test("recusa procedimento realizado sem data", async () => {
    const { status, corpo } = await api.chamar("POST", "/api/procedimentos", {
      ...procedimento,
      status: "realizado",
    });
    assert.equal(status, 400);
    assert.deepEqual(corpo.details, [
      "Informe a data do procedimento realizado.",
    ]);
  });

  test("recusa dente fora da numeração FDI", async () => {
    const { status, corpo } = await api.chamar("POST", "/api/procedimentos", {
      ...procedimento,
      dente: "19",
    });
    assert.equal(status, 400);
    assert.match(corpo.details[0], /numeração FDI/);
  });

  test("marca o procedimento como realizado", async () => {
    const { status, corpo } = await api.chamar(
      "PUT",
      `/api/procedimentos/${idPlanejado}`,
      { ...procedimento, status: "realizado", data: "2026-10-01" },
    );
    assert.equal(status, 200);
    assert.equal(corpo.status, "realizado");
    assert.equal(corpo.data, "2026-10-01");
  });

  test("lista planejados primeiro e não mistura pacientes", async () => {
    await api.chamar("POST", "/api/procedimentos", {
      ...procedimento,
      tipo: "Extração",
      dente: "",
    });
    await api.chamar("POST", "/api/procedimentos", {
      ...procedimento,
      cpf: "99999999999",
    });
    const { status, corpo } = await api.chamar(
      "GET",
      "/api/procedimentos?cpf=12312312312",
    );
    assert.equal(status, 200);
    assert.deepEqual(
      corpo.map((item) => [item.tipo, item.status]),
      [
        ["Extração", "planejado"],
        ["Restauração", "realizado"],
      ],
    );
  });

  test("responde 404 ao editar ou excluir procedimento inexistente", async () => {
    const edicao = await api.chamar(
      "PUT",
      "/api/procedimentos/999999",
      procedimento,
    );
    const exclusao = await api.chamar("DELETE", "/api/procedimentos/999999");
    assert.equal(edicao.status, 404);
    assert.equal(exclusao.status, 404);
  });

  test("exclui um procedimento", async () => {
    const { status } = await api.chamar(
      "DELETE",
      `/api/procedimentos/${idPlanejado}`,
    );
    assert.equal(status, 200);
    const { corpo } = await api.chamar(
      "GET",
      "/api/procedimentos?cpf=12312312312",
    );
    assert.deepEqual(
      corpo.map((item) => item.tipo),
      ["Extração"],
    );
  });
});
