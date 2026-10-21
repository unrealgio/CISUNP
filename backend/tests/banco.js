process.env.DB_NAME = "cis_test";

const path = require("path");
const { execFileSync } = require("child_process");
const sequelize = require("../config/database");

if (sequelize.config.database !== "cis_test") {
  throw new Error("Os testes só podem usar o banco cis_test.");
}

const cli = path.join(
  __dirname,
  "..",
  "node_modules",
  "sequelize-cli",
  "lib",
  "sequelize",
);

async function prepararBanco() {
  await sequelize.getQueryInterface().dropAllTables();
  execFileSync(process.execPath, [cli, "db:migrate"], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, DB_NAME: "cis_test" },
    stdio: "pipe",
  });
}

function fecharBanco() {
  return sequelize.close();
}

module.exports = { prepararBanco, fecharBanco };
