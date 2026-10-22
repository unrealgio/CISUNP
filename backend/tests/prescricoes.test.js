const { prepararBanco, fecharBanco } = require("./banco");
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { iniciarServidor } = require("./ajudantes");

describe("prescrições", () => {
  let api;

  before(async () => {
    await prepararBanco();
    api = await iniciarServidor();
    for (const cpf of ["12312312312", "98798798798"]) {
      await api.chamar("POST", "/api/pacientes", { cpf, patient: "Teste" });
    }
  });

  after(async () => {
    await api.fechar();
    await fecharBanco();
  });

  test("adiciona uma prescrição com 201", async () => {
    const { status, corpo } = await api.chamar("POST", "/api/prescricoes", {
      cpf: "12312312312",
      medicamento: "Amoxicilina",
      dose: "500mg",
      frequencia: "8 em 8 horas",
    });
    assert.equal(status, 201);
    assert.equal(corpo.medicamento, "Amoxicilina");
  });

  test("lista as prescrições do paciente da mais nova para a mais antiga", async () => {
    await api.chamar("POST", "/api/prescricoes", {
      cpf: "12312312312",
      medicamento: "Ibuprofeno",
    });
    const { status, corpo } = await api.chamar(
      "GET",
      "/api/prescricoes?cpf=12312312312",
    );
    assert.equal(status, 200);
    assert.deepEqual(
      corpo.map((item) => item.medicamento),
      ["Ibuprofeno", "Amoxicilina"],
    );
  });

  test("não mistura prescrições de outro paciente", async () => {
    const { corpo } = await api.chamar(
      "GET",
      "/api/prescricoes?cpf=98798798798",
    );
    assert.deepEqual(corpo, []);
  });

  test("recusa prescrição para CPF sem cadastro com 404", async () => {
    const { status, corpo } = await api.chamar("POST", "/api/prescricoes", {
      cpf: "99999999999",
      medicamento: "Dipirona",
    });
    assert.equal(status, 404);
    assert.equal(corpo.error, "Paciente não encontrado.");
  });
});
