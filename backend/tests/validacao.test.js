const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const {
  validateAgendamentoBody,
  validateChangePassword,
  validatePacienteBody,
  validatePrescricaoBody,
} = require("../src/middleware/validation");
const { rodarMiddleware } = require("./ajudantes");

const texto255 = "a".repeat(255);
const texto256 = "a".repeat(256);

describe("validateAgendamentoBody", () => {
  const agendamento = {
    time: "08:00",
    date: "2099-01-10",
    patient: "Paciente Teste",
  };

  test("aceita um agendamento válido", () => {
    const { chamouNext } = rodarMiddleware(validateAgendamentoBody, {
      body: agendamento,
    });
    assert.equal(chamouNext, true);
  });

  test("aceita 255 caracteres em telefone, médico e observações", () => {
    const { chamouNext } = rodarMiddleware(validateAgendamentoBody, {
      body: {
        ...agendamento,
        phone: texto255,
        medico: texto255,
        notes: texto255,
      },
    });
    assert.equal(chamouNext, true);
  });

  test("recusa mais de 255 caracteres em telefone, médico e observações", () => {
    const { res, chamouNext } = rodarMiddleware(validateAgendamentoBody, {
      body: {
        ...agendamento,
        phone: texto256,
        medico: texto256,
        notes: texto256,
      },
    });
    assert.equal(chamouNext, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.corpo.details, [
      "O campo Telefone deve ter no máximo 255 caracteres.",
      "O campo Médico deve ter no máximo 255 caracteres.",
      "O campo Observações deve ter no máximo 255 caracteres.",
    ]);
  });

  test("recusa requisição sem body com 400", () => {
    const { res, chamouNext } = rodarMiddleware(validateAgendamentoBody, {});
    assert.equal(chamouNext, false);
    assert.equal(res.statusCode, 400);
  });

  test("recusa CPF fora do formato de 11 números", () => {
    const { res } = rodarMiddleware(validateAgendamentoBody, {
      body: { ...agendamento, cpf: "123.456.789-00" },
    });
    assert.deepEqual(res.corpo.details, ["CPF deve conter 11 números."]);
  });
});

describe("validatePrescricaoBody", () => {
  const prescricao = { cpf: "12345678901", medicamento: "Amoxicilina" };

  test("aceita uma prescrição válida", () => {
    const { chamouNext } = rodarMiddleware(validatePrescricaoBody, {
      body: { ...prescricao, dose: texto255 },
    });
    assert.equal(chamouNext, true);
  });

  test("recusa mais de 255 caracteres em dose, frequência e observação", () => {
    const { res } = rodarMiddleware(validatePrescricaoBody, {
      body: {
        ...prescricao,
        dose: texto256,
        frequencia: texto256,
        observacao: texto256,
      },
    });
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.corpo.details, [
      "O campo Dose deve ter no máximo 255 caracteres.",
      "O campo Frequência deve ter no máximo 255 caracteres.",
      "O campo Observação deve ter no máximo 255 caracteres.",
    ]);
  });
});

describe("validatePacienteBody", () => {
  test("recusa endereço com mais de 255 caracteres", () => {
    const { res } = rodarMiddleware(validatePacienteBody, {
      body: {
        cpf: "12345678901",
        patient: "Paciente Teste",
        endereco: texto256,
      },
    });
    assert.deepEqual(res.corpo.details, [
      "O campo Endereço deve ter no máximo 255 caracteres.",
    ]);
  });
});

describe("validateChangePassword", () => {
  test("aceita senha atual e nova senha diferentes", () => {
    const { chamouNext } = rodarMiddleware(validateChangePassword, {
      body: { senhaAtual: "senha123", novaSenha: "NovaSenha123" },
    });
    assert.equal(chamouNext, true);
  });

  test("exige a senha atual", () => {
    const { res } = rodarMiddleware(validateChangePassword, {
      body: { novaSenha: "NovaSenha123" },
    });
    assert.deepEqual(res.corpo.details, ["Informe a senha atual."]);
  });

  test("recusa nova senha igual à atual", () => {
    const { res } = rodarMiddleware(validateChangePassword, {
      body: { senhaAtual: "NovaSenha123", novaSenha: "NovaSenha123" },
    });
    assert.deepEqual(res.corpo.details, [
      "A nova senha deve ser diferente da atual.",
    ]);
  });

  test("recusa nova senha com menos de 8 caracteres", () => {
    const { res } = rodarMiddleware(validateChangePassword, {
      body: { senhaAtual: "senha123", novaSenha: "curta" },
    });
    assert.deepEqual(res.corpo.details, [
      "A nova senha deve ter entre 8 e 72 caracteres.",
    ]);
  });
});
