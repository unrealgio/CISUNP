const TELEFONE_VALIDO = "^[1-9]{2}(9[0-9]{8}|[2-8][0-9]{7})$";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const tabela of ["pacientes", "agendamentos"]) {
        await queryInterface.sequelize.query(
          `
          UPDATE ${tabela} SET phone = CASE
            WHEN regexp_replace(phone, '\\D', '', 'g') ~ '${TELEFONE_VALIDO}'
              THEN regexp_replace(phone, '\\D', '', 'g')
            ELSE NULL
          END
          WHERE phone IS NOT NULL
          `,
          { transaction },
        );
      }
    });
  },

  // A FORMATAÇÃO ORIGINAL SE PERDE NO "UP"; NÃO HÁ COMO DEVOLVÊ-LA
  async down() {},
};
