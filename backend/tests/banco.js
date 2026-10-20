process.env.DB_NAME = "cis_test";

const sequelize = require("../config/database");

if (sequelize.config.database !== "cis_test") {
  throw new Error("Os testes só podem usar o banco cis_test.");
}

function prepararBanco() {
  return sequelize.sync({ force: true });
}

function fecharBanco() {
  return sequelize.close();
}

module.exports = { prepararBanco, fecharBanco };
