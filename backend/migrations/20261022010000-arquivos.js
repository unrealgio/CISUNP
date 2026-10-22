module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("arquivos", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      cpf: { type: Sequelize.STRING, allowNull: false },
      nome: { type: Sequelize.STRING, allowNull: false },
      categoria: { type: Sequelize.STRING, allowNull: false },
      tipoMime: { type: Sequelize.STRING, allowNull: false },
      tamanho: { type: Sequelize.INTEGER, allowNull: false },
      caminho: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("arquivos", ["cpf"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("arquivos");
  },
};
