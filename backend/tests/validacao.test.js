const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const {
  validateAgendamentoBody,
  validateChangePassword,
  validatePacienteBody,
  validatePrescricaoBody,
  validateProcedimentoBody,
  validateStatusBody,
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

  test("aceita 255 caracteres em médico e observações", () => {
    const { chamouNext } = rodarMiddleware(validateAgendamentoBody, {
      body: {
        ...agendamento,
        medico: texto255,
        notes: texto255,
      },
    });
    assert.equal(chamouNext, true);
  });

  test("recusa mais de 255 caracteres em médico e observações", () => {
    const { res, chamouNext } = rodarMiddleware(validateAgendamentoBody, {
      body: {
        ...agendamento,
        medico: texto256,
        notes: texto256,
      },
    });
    assert.equal(chamouNext, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.corpo.details, [
      "O campo Médico deve ter no máximo 255 caracteres.",
      "O campo Observações deve ter no máximo 255 caracteres.",
    ]);
  });

  test("aceita telefone fixo e celular, com ou sem máscara, e vazio", () => {
    for (const phone of ["84999990000", "(84) 99999-0000", "8432011234", "(84) 3201-1234", "", undefined]) {
      const { chamouNext } = rodarMiddleware(validateAgendamentoBody, {
        body: { ...agendamento, phone },
      });
      assert.equal(chamouNext, true, String(phone));
    }
  });

  test("recusa telefone sem DDD, com dígitos a mais ou com letras", () => {
    for (const phone of ["99999000", "849912313123", "04999990000", "8419999000", "aaaa"]) {
      const { res } = rodarMiddleware(validateAgendamentoBody, {
        body: { ...agendamento, phone },
      });
      assert.deepEqual(res.corpo?.details, ["Telefone deve ter DDD + número (10 ou 11 dígitos)."], phone);
    }
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

describe("validateStatusBody", () => {
  test("aceita os cinco status", () => {
    for (const status of ["pendente", "confirmada", "realizada", "faltou", "cancelada"]) {
      const { chamouNext } = rodarMiddleware(validateStatusBody, {
        body: { status },
      });
      assert.equal(chamouNext, true, status);
    }
  });

  test("recusa status desconhecido ou ausente", () => {
    for (const body of [{ status: "Confirmada" }, { status: "x" }, {}]) {
      const { res } = rodarMiddleware(validateStatusBody, { body });
      assert.equal(res.statusCode, 400);
    }
  });
});

describe("validateProcedimentoBody", () => {
  const procedimento = {
    cpf: "12345678901",
    tipo: "Restauração",
    status: "planejado",
  };

  test("aceita dentes permanentes e de leite na numeração FDI", () => {
    for (const dente of ["11", "18", "36", "48", "51", "85"]) {
      const { chamouNext } = rodarMiddleware(validateProcedimentoBody, {
        body: { ...procedimento, dente },
      });
      assert.equal(chamouNext, true, dente);
    }
  });

  test("recusa dentes que não existem na numeração FDI", () => {
    for (const dente of ["10", "19", "49", "56", "91", "3"]) {
      const { res } = rodarMiddleware(validateProcedimentoBody, {
        body: { ...procedimento, dente },
      });
      assert.equal(res.statusCode, 400, dente);
    }
  });

  test("recusa status desconhecido", () => {
    const { res } = rodarMiddleware(validateProcedimentoBody, {
      body: { ...procedimento, status: "feito" },
    });
    assert.deepEqual(res.corpo.details, ["Status deve ser: planejado, realizado."]);
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
    assert.deepEqual(res.corpo.details, ["O campo Endereço deve ter no máximo 255 caracteres."]);
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
    assert.deepEqual(res.corpo.details, ["A nova senha deve ser diferente da atual."]);
  });

  test("recusa nova senha com menos de 8 caracteres", () => {
    const { res } = rodarMiddleware(validateChangePassword, {
      body: { senhaAtual: "senha123", novaSenha: "curta" },
    });
    assert.deepEqual(res.corpo.details, ["A nova senha deve ter entre 8 e 72 caracteres."]);
  });
});
