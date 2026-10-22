// DADOS FICTÍCIOS PARA DEMONSTRAÇÃO: npm run db:seed (PODE RODAR MAIS DE UMA VEZ)

// CALCULA OS DOIS DÍGITOS VERIFICADORES PARA O CPF SER VÁLIDO
function cpfValido(base) {
  const digitos = base.split("").map(Number);
  for (const tamanho of [9, 10]) {
    const soma = digitos
      .slice(0, tamanho)
      .reduce((total, d, i) => total + d * (tamanho + 1 - i), 0);
    const resto = (soma * 10) % 11;
    digitos.push(resto === 10 ? 0 : resto);
  }
  return digitos.join("");
}

// DATA RELATIVA A HOJE, PARA SEMPRE HAVER CONSULTAS PASSADAS E FUTURAS
function dia(deslocamento) {
  const data = new Date();
  data.setDate(data.getDate() + deslocamento);
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const diaDoMes = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${diaDoMes}`;
}

const MEDICOS = ["Dra. Ana Lima", "Dr. Bruno Costa", "Dra. Carla Mendes"];

const PACIENTES = [
  [
    "Ana Beatriz Rocha",
    "529982247",
    "84991234567",
    28,
    "Rua das Flores, 120 - Natal/RN",
    0,
    "Alergia a penicilina.",
  ],
  [
    "Bruno Henrique Alves",
    "123456780",
    "84987654321",
    35,
    "Av. Prudente de Morais, 900 - Natal/RN",
    1,
    null,
  ],
  [
    "Camila Duarte",
    "987654321",
    "8432011234",
    42,
    "Rua Mossoró, 55 - Natal/RN",
    2,
    "Hipertensa.",
  ],
  [
    "Diego Martins",
    "111444777",
    "84996543210",
    19,
    "Rua Apodi, 300 - Natal/RN",
    0,
    null,
  ],
  [
    "Eduarda Nogueira",
    "222555888",
    "84998887766",
    51,
    "Av. Hermes da Fonseca, 1500 - Natal/RN",
    1,
    "Usa aparelho ortodôntico.",
  ],
  [
    "Felipe Araújo",
    "333666999",
    "8432225566",
    63,
    "Rua Seridó, 48 - Natal/RN",
    2,
    null,
  ],
  [
    "Gabriela Pires",
    "444777111",
    "84991112233",
    24,
    "Rua Jaguarari, 712 - Natal/RN",
    0,
    null,
  ],
  [
    "Henrique Castro",
    "555888222",
    "84993334455",
    38,
    "Av. Salgado Filho, 2100 - Natal/RN",
    1,
    "Diabético tipo 2.",
  ],
  [
    "Isabela Moura",
    "666999333",
    "84995556677",
    31,
    "Rua Potengi, 80 - Natal/RN",
    2,
    null,
  ],
  [
    "João Pedro Lins",
    "777111444",
    "84997778899",
    12,
    "Rua Açu, 15 - Natal/RN",
    0,
    "Paciente infantil; vir com responsável.",
  ],
  [
    "Larissa Teixeira",
    "888222555",
    "8432334455",
    46,
    "Av. Engenheiro Roberto Freire, 3000 - Natal/RN",
    1,
    null,
  ],
  [
    "Marcos Vinícius Barros",
    "999333666",
    "84992221100",
    57,
    "Rua Mipibu, 230 - Natal/RN",
    2,
    null,
  ],
].map(([patient, base, phone, idade, endereco, medico, notes]) => ({
  patient,
  cpf: cpfValido(base),
  phone,
  idade,
  endereco,
  medico: MEDICOS[medico],
  notes,
}));

// [ÍNDICE DO PACIENTE (OU NOME AVULSO), DIAS A PARTIR DE HOJE, HORÁRIO, STATUS, MÉDICO, OBSERVAÇÕES]
const CONSULTAS = [
  [0, -20, "13:00", "realizada", 0, "Avaliação inicial."],
  [1, -18, "14:00", "realizada", 1, null],
  [2, -15, "12:30", "faltou", 2, null],
  [3, -14, "15:30", "realizada", 0, "Limpeza."],
  [4, -12, "16:00", "cancelada", 1, "Paciente remarcou."],
  [5, -10, "13:30", "realizada", 2, null],
  [6, -8, "14:30", "realizada", 0, null],
  [7, -7, "17:00", "faltou", 1, null],
  ["Rafael Gomes", -6, "15:00", "realizada", 2, "Atendimento de urgência."],
  [8, -5, "12:30", "realizada", 2, "Restauração no dente 36."],
  [0, -3, "16:30", "realizada", 0, "Retorno."],
  [9, -2, "13:00", "cancelada", 0, null],
  [10, -1, "14:00", "realizada", 1, null],
  [2, 1, "13:00", "confirmada", 2, "Remarcação da falta."],
  [11, 1, "15:30", "pendente", 2, null],
  [3, 2, "14:00", "confirmada", 0, null],
  [4, 3, "16:00", "pendente", 1, null],
  [
    "Patrícia Souza",
    3,
    "17:30",
    "pendente",
    1,
    "Primeira consulta, sem cadastro.",
  ],
  [7, 5, "12:30", "pendente", 1, "Remarcação da falta."],
  [8, 6, "13:30", "confirmada", 2, "Tratamento de canal (46)."],
  [1, 7, "15:00", "pendente", 1, null],
  [6, 8, "16:30", "cancelada", 0, null],
  [9, 9, "14:30", "pendente", 0, null],
  [0, 14, "13:00", "pendente", 0, "Retorno semestral."],
];

const AVULSOS = {
  "Rafael Gomes": "84990001122",
  "Patrícia Souza": "84990003344",
};

// [ÍNDICE DO PACIENTE, PROCEDIMENTO, DENTE, STATUS, DIAS A PARTIR DE HOJE (OU NULL), OBSERVAÇÃO]
const PROCEDIMENTOS = [
  [0, "Avaliação", null, "realizado", -20, null],
  [0, "Limpeza (profilaxia)", null, "realizado", -3, null],
  [0, "Clareamento", null, "planejado", null, "Após o retorno semestral."],
  [3, "Limpeza (profilaxia)", null, "realizado", -14, null],
  [8, "Restauração", "36", "realizado", -5, "Resina composta, face oclusal."],
  [8, "Tratamento de canal", "46", "planejado", 6, null],
  [5, "Extração", "18", "realizado", -10, null],
  [9, "Selante", "75", "planejado", 9, "Dente de leite."],
  [10, "Raspagem", null, "realizado", -1, null],
];

// [ÍNDICE DO PACIENTE, MEDICAMENTO, DOSE, FREQUÊNCIA, OBSERVAÇÃO]
const PRESCRICOES = [
  [5, "Amoxicilina", "500 mg", "8 em 8 horas, por 7 dias", "Após a extração."],
  [5, "Ibuprofeno", "400 mg", "8 em 8 horas, se houver dor", null],
  [8, "Paracetamol", "750 mg", "6 em 6 horas, se houver dor", null],
  [0, "Clorexidina 0,12%", "15 ml", "Bochechar 2 vezes ao dia", "Por 14 dias."],
];

async function apagarDemonstracao(queryInterface, transaction) {
  const cpfs = PACIENTES.map((p) => `'${p.cpf}'`).join(", ");
  const avulsos = Object.keys(AVULSOS)
    .map((nome) => `'${nome}'`)
    .join(", ");
  const ids = `SELECT id FROM pacientes WHERE cpf IN (${cpfs})`;
  for (const tabela of [
    "agendamentos",
    "prescricoes",
    "procedimentos",
    "prontuarios",
    "arquivos",
  ]) {
    await queryInterface.sequelize.query(
      `DELETE FROM ${tabela} WHERE "pacienteId" IN (${ids})`,
      { transaction },
    );
  }
  await queryInterface.sequelize.query(
    `DELETE FROM agendamentos WHERE "pacienteId" IS NULL AND patient IN (${avulsos})`,
    { transaction },
  );
  await queryInterface.sequelize.query(
    `DELETE FROM pacientes WHERE cpf IN (${cpfs})`,
    { transaction },
  );
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await apagarDemonstracao(queryInterface, transaction);

      await queryInterface.bulkInsert("pacientes", PACIENTES, { transaction });
      const [linhas] = await queryInterface.sequelize.query(
        `SELECT id, cpf FROM pacientes WHERE cpf IN (${PACIENTES.map((p) => `'${p.cpf}'`).join(", ")})`,
        { transaction },
      );
      const idPorCpf = new Map(linhas.map((l) => [l.cpf, l.id]));
      const idDoPaciente = (indice) => idPorCpf.get(PACIENTES[indice].cpf);
      const agora = new Date();

      await queryInterface.bulkInsert(
        "agendamentos",
        CONSULTAS.map(([quem, dias, time, status, medico, notes]) => {
          const avulso = typeof quem === "string";
          return {
            pacienteId: avulso ? null : idDoPaciente(quem),
            patient: avulso ? quem : null,
            phone: avulso ? AVULSOS[quem] : null,
            date: dia(dias),
            time,
            status,
            medico: MEDICOS[medico],
            notes,
          };
        }),
        { transaction },
      );

      await queryInterface.bulkInsert(
        "procedimentos",
        PROCEDIMENTOS.map(
          ([indice, tipo, dente, status, dias, observacao]) => ({
            pacienteId: idDoPaciente(indice),
            tipo,
            dente,
            status,
            data: dias === null ? null : dia(dias),
            observacao,
            createdAt: agora,
            updatedAt: agora,
          }),
        ),
        { transaction },
      );

      await queryInterface.bulkInsert(
        "prescricoes",
        PRESCRICOES.map(
          ([indice, medicamento, dose, frequencia, observacao]) => ({
            pacienteId: idDoPaciente(indice),
            medicamento,
            dose,
            frequencia,
            observacao,
            createdAt: agora,
            updatedAt: agora,
          }),
        ),
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction((transaction) =>
      apagarDemonstracao(queryInterface, transaction),
    );
  },
};
