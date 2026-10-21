module.exports = {
  async up(queryInterface, Sequelize) {
    const id = {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    };
    const datas = {
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    };

    await queryInterface.createTable("users", {
      id,
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      senha: { type: Sequelize.STRING, allowNull: false },
    });

    await queryInterface.createTable("pacientes", {
      id,
      patient: { type: Sequelize.STRING, allowNull: false },
      cpf: { type: Sequelize.STRING, allowNull: false, unique: true },
      phone: Sequelize.STRING,
      medico: Sequelize.STRING,
      idade: Sequelize.INTEGER,
      endereco: Sequelize.STRING,
      notes: Sequelize.STRING,
      deletedAt: Sequelize.DATE,
    });

    await queryInterface.createTable("agendamentos", {
      id,
      time: { type: Sequelize.STRING, allowNull: false },
      date: { type: Sequelize.STRING, allowNull: false },
      patient: { type: Sequelize.STRING, allowNull: false },
      cpf: Sequelize.STRING,
      phone: Sequelize.STRING,
      notes: Sequelize.STRING,
      medico: Sequelize.STRING,
    });
    await queryInterface.addIndex("agendamentos", ["date", "time"], {
      unique: true,
      name: "agendamentos_date_time",
    });

    await queryInterface.createTable("prescricoes", {
      id,
      cpf: { type: Sequelize.STRING, allowNull: false },
      medicamento: Sequelize.STRING,
      dose: Sequelize.STRING,
      frequencia: Sequelize.STRING,
      observacao: Sequelize.STRING,
      ...datas,
    });

    await queryInterface.createTable("prontuarios", {
      id,
      cpf: { type: Sequelize.STRING, allowNull: false },
      date: Sequelize.STRING,
      time: Sequelize.STRING,
      dados: Sequelize.JSON,
      pdf: Sequelize.STRING,
      ...datas,
    });
  },

  async down(queryInterface) {
    for (const tabela of [
      "prontuarios",
      "prescricoes",
      "agendamentos",
      "pacientes",
      "users",
    ]) {
      await queryInterface.dropTable(tabela);
    }
  },
};
