const {
  apagarTabelas,
  rodarMigrations,
  fecharBanco,
  sequelize,
} = require("./banco");
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const consultar = async (sql) => (await sequelize.query(sql))[0];

describe("migration dos telefones (só dígitos)", () => {
  before(async () => {
    await apagarTabelas();
    rodarMigrations("db:migrate", "--to", "20261023000000-paciente-id.js");

    await sequelize.query(`
      INSERT INTO pacientes (patient, cpf, phone) VALUES
        ('Com máscara', '11111111111', '(84) 99999-0000'),
        ('Com espaço', '22222222222', '84 3201 1234'),
        ('Doze dígitos', '33333333333', '849912313123'),
        ('Letras', '44444444444', 'aaaa'),
        ('Sem telefone', '55555555555', NULL);
      INSERT INTO agendamentos (time, date, patient, phone) VALUES
        ('13:00', '2026-01-10', 'Avulso', '(84) 98888-7777');
    `);

    rodarMigrations("db:migrate");
  });

  after(fecharBanco);

  const telefoneDe = async (nome) =>
    (
      await consultar(`SELECT phone FROM pacientes WHERE patient = '${nome}'`)
    )[0].phone;

  test("guarda só os dígitos dos telefones válidos", async () => {
    assert.equal(await telefoneDe("Com máscara"), "84999990000");
    assert.equal(await telefoneDe("Com espaço"), "8432011234");
  });

  test("telefones inválidos viram vazio", async () => {
    assert.equal(await telefoneDe("Doze dígitos"), null);
    assert.equal(await telefoneDe("Letras"), null);
    assert.equal(await telefoneDe("Sem telefone"), null);
  });

  test("também padroniza o telefone dos agendamentos avulsos", async () => {
    const [avulso] = await consultar(`SELECT phone FROM agendamentos`);
    assert.equal(avulso.phone, "84988887777");
  });
});
