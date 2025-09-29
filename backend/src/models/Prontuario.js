const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Prontuario = sequelize.define("Prontuario", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  cpf: { type: DataTypes.STRING, allowNull: false },
  date: DataTypes.STRING,
  time: DataTypes.STRING,
  dados: DataTypes.JSON, // Salva todos os campos do prontuário
  pdf: DataTypes.STRING, // Caminho do PDF gerado
}, { timestamps: true });

module.exports = Prontuario;