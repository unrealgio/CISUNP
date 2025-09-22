const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME || "cisunp",
  process.env.DB_USER || "postgres",
  process.env.DB_PASS || "123456aA",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    port: process.env.DB_PORT || 5432,
    logging: false,
  }
);
module.exports = sequelize;
