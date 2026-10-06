const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: false,
  },
);
module.exports = sequelize;
