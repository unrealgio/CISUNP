const { apagarTabelas, rodarMigrations, fecharBanco, sequelize } = require("./banco");
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const ANTES_DA_MIGRATION = "20261022010000-arquivos.js";

const consultar = async (sql) => (await sequelize.query(sql))[0];

describe("migration pacienteId (dados antigos ligados pelo CPF)", () => {
  before(async () => {
    await apagarTabelas();
    rodarMigrations("db:migrate", "--to", ANTES_DA_MIGRATION);

    await sequelize.query(`
      INSERT INTO pacientes (patient, cpf, phone) VALUES ('Maria Cadastro', '11111111111', NULL);
      INSERT INTO agendamentos (time, date, patient, cpf, phone) VALUES
        ('13:00', '2026-01-10', 'Nome Antigo', '11111111111', '84911112222'),
        ('13:30', '2026-01-10', 'Pessoa Avulsa', '', '84933334444'),
        ('14:00', '2026-01-10', 'Pedro Agenda', '22222222222', NULL);
      INSERT INTO prescricoes (cpf, medicamento, "createdAt", "updatedAt") VALUES
        ('11111111111', 'Amoxicilina', NOW(), NOW()),
        ('33333333333', 'Ibuprofeno', NOW(), NOW());
      INSERT INTO procedimentos (cpf, tipo, "createdAt", "updatedAt") VALUES
        ('22222222222', 'Limpeza', NOW(), NOW());
    `);

    rodarMigrations("db:migrate");
  });

  after(async () => {
    rodarMigrations("db:migrate");
    await fecharBanco();
  });

  const pacientePorCpf = async (cpf) => (await consultar(`SELECT * FROM pacientes WHERE cpf = '${cpf}'`))[0];

  test("liga o agendamento ao cadastro e usa o nome e o telefone de lá", async () => {
    const maria = await pacientePorCpf("11111111111");
    const [agendamento] = await consultar(`SELECT * FROM agendamentos WHERE time = '13:00'`);
    assert.equal(agendamento.pacienteId, maria.id);
    assert.equal(agendamento.patient, null);
    assert.equal(agendamento.phone, null);
    assert.equal(maria.patient, "Maria Cadastro");
    assert.equal(maria.phone, "84911112222");
  });

  test("agendamento sem CPF continua avulso, com nome e telefone próprios", async () => {
    const [avulso] = await consultar(`SELECT * FROM agendamentos WHERE time = '13:30'`);
    assert.equal(avulso.pacienteId, null);
    assert.equal(avulso.patient, "Pessoa Avulsa");
    assert.equal(avulso.phone, "84933334444");
  });

  test("CPF sem cadastro vira paciente (com o nome da agenda, se houver)", async () => {
    const pedro = await pacientePorCpf("22222222222");
    const semNome = await pacientePorCpf("33333333333");
    assert.equal(pedro.patient, "Pedro Agenda");
    assert.equal(semNome.patient, "Paciente sem nome");

    const [procedimento] = await consultar(`SELECT * FROM procedimentos`);
    assert.equal(procedimento.pacienteId, pedro.id);
  });

  test("as tabelas não guardam mais o CPF", async () => {
    const colunas = await consultar(`
      SELECT table_name FROM information_schema.columns
      WHERE column_name = 'cpf' AND table_schema = 'public'
    `);
    assert.deepEqual(
      colunas.map((c) => c.table_name),
      ["pacientes"],
    );
  });

  test("o banco recusa pacienteId inexistente (chave estrangeira)", async () => {
    await assert.rejects(
      sequelize.query(`
        INSERT INTO prescricoes ("pacienteId", medicamento, "createdAt", "updatedAt")
        VALUES (999999, 'X', NOW(), NOW())
      `),
      /prescricoes_pacienteId_fkey/,
    );
  });

  test("o banco recusa agendamento sem paciente e sem nome", async () => {
    await assert.rejects(
      sequelize.query(`
        INSERT INTO agendamentos (time, date) VALUES ('15:00', '2026-01-10')
      `),
      /agendamentos_paciente_ou_nome/,
    );
  });

  test("desfazer a migration devolve o CPF e o nome às tabelas", async () => {
    rodarMigrations("db:migrate:undo:all", "--to", "20261023000000-paciente-id.js");

    const [agendamento] = await consultar(`SELECT * FROM agendamentos WHERE time = '13:00'`);
    assert.equal(agendamento.cpf, "11111111111");
    assert.equal(agendamento.patient, "Maria Cadastro");

    const prescricoes = await consultar(`SELECT cpf FROM prescricoes ORDER BY cpf`);
    assert.deepEqual(
      prescricoes.map((p) => p.cpf),
      ["11111111111", "33333333333"],
    );
  });
});
