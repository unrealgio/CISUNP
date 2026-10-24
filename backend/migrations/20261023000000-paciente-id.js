const TABELAS_DO_PACIENTE = ["prescricoes", "prontuarios", "procedimentos", "arquivos"];
const TODAS = ["agendamentos", ...TABELAS_DO_PACIENTE];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const sql = (texto) => queryInterface.sequelize.query(texto, { transaction });

      // CPF SEM CADASTRO VIRA PACIENTE (USA O NOME DO AGENDAMENTO MAIS RECENTE, SE HOUVER)
      for (const tabela of TABELAS_DO_PACIENTE) {
        await sql(`
          INSERT INTO pacientes (patient, cpf)
          SELECT COALESCE(
            (SELECT a.patient FROM agendamentos a WHERE a.cpf = o.cpf ORDER BY a.id DESC LIMIT 1),
            'Paciente sem nome'
          ), o.cpf
          FROM (
            SELECT DISTINCT t.cpf FROM ${tabela} t
            WHERE NOT EXISTS (SELECT 1 FROM pacientes p WHERE p.cpf = t.cpf)
          ) o
        `);
      }

      for (const tabela of TODAS) {
        await queryInterface.addColumn(
          tabela,
          "pacienteId",
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: "pacientes", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          { transaction },
        );
        await sql(`
          UPDATE ${tabela} t SET "pacienteId" = p.id
          FROM pacientes p WHERE p.cpf = t.cpf
        `);
      }

      // O TELEFONE QUE SÓ EXISTIA NO AGENDAMENTO PASSA PARA O CADASTRO
      await sql(`
        UPDATE pacientes p SET phone = (
          SELECT a.phone FROM agendamentos a
          WHERE a."pacienteId" = p.id AND a.phone <> ''
          ORDER BY a.date DESC, a.time DESC LIMIT 1
        )
        WHERE COALESCE(p.phone, '') = ''
          AND EXISTS (
            SELECT 1 FROM agendamentos a
            WHERE a."pacienteId" = p.id AND a.phone <> ''
          )
      `);

      // AGENDAMENTO DE PACIENTE CADASTRADO NÃO GUARDA MAIS NOME E TELEFONE (VÊM DO CADASTRO)
      await queryInterface.changeColumn(
        "agendamentos",
        "patient",
        { type: Sequelize.STRING, allowNull: true },
        { transaction },
      );
      await sql(`
        UPDATE agendamentos SET patient = NULL, phone = NULL
        WHERE "pacienteId" IS NOT NULL
      `);
      await sql(`
        ALTER TABLE agendamentos ADD CONSTRAINT agendamentos_paciente_ou_nome
        CHECK ("pacienteId" IS NOT NULL OR patient IS NOT NULL)
      `);

      for (const tabela of TABELAS_DO_PACIENTE) {
        await sql(`ALTER TABLE ${tabela} ALTER COLUMN "pacienteId" SET NOT NULL`);
      }
      for (const tabela of TODAS) {
        await queryInterface.removeColumn(tabela, "cpf", { transaction });
        await queryInterface.addIndex(tabela, ["pacienteId"], { transaction });
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const sql = (texto) => queryInterface.sequelize.query(texto, { transaction });

      for (const tabela of TODAS) {
        await queryInterface.addColumn(tabela, "cpf", { type: Sequelize.STRING, allowNull: true }, { transaction });
        await sql(`
          UPDATE ${tabela} t SET cpf = p.cpf
          FROM pacientes p WHERE p.id = t."pacienteId"
        `);
      }

      await sql(`
        UPDATE agendamentos a SET patient = p.patient, phone = p.phone
        FROM pacientes p WHERE p.id = a."pacienteId"
      `);
      await sql(`ALTER TABLE agendamentos DROP CONSTRAINT agendamentos_paciente_ou_nome`);
      await sql(`ALTER TABLE agendamentos ALTER COLUMN patient SET NOT NULL`);

      for (const tabela of TABELAS_DO_PACIENTE) {
        await sql(`ALTER TABLE ${tabela} ALTER COLUMN cpf SET NOT NULL`);
      }
      await queryInterface.addIndex("procedimentos", ["cpf"], { transaction });
      await queryInterface.addIndex("arquivos", ["cpf"], { transaction });

      for (const tabela of TODAS) {
        await queryInterface.removeColumn(tabela, "pacienteId", {
          transaction,
        });
      }
    });
  },
};
