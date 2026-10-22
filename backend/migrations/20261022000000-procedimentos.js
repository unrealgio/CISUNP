module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("procedimentos", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      cpf: { type: Sequelize.STRING, allowNull: false },
      tipo: { type: Sequelize.STRING, allowNull: false },
      dente: Sequelize.STRING,
      data: Sequelize.STRING,
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "planejado",
      },
      observacao: Sequelize.STRING,
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("procedimentos", ["cpf"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("procedimentos");
  },
};
