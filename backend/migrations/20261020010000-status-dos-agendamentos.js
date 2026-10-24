module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("agendamentos", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "pendente",
    });

    // CONSULTA CANCELADA LIBERA O HORÁRIO: SÓ AS NÃO CANCELADAS PRECISAM SER ÚNICAS
    await queryInterface.removeIndex("agendamentos", "agendamentos_date_time");
    await queryInterface.addIndex("agendamentos", ["date", "time"], {
      unique: true,
      name: "agendamentos_horario_ativo",
      where: { status: { [Sequelize.Op.ne]: "cancelada" } },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("agendamentos", "agendamentos_horario_ativo");
    await queryInterface.removeColumn("agendamentos", "status");
    await queryInterface.addIndex("agendamentos", ["date", "time"], {
      unique: true,
      name: "agendamentos_date_time",
    });
  },
};
