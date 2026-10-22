const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Prescricao = sequelize.define(
  "Prescricao",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pacienteId: { type: DataTypes.INTEGER, allowNull: false },
    medicamento: DataTypes.STRING,
    dose: DataTypes.STRING,
    frequencia: DataTypes.STRING,
    observacao: DataTypes.STRING,
  },
  {
    tableName: "prescricoes",
    timestamps: true,
  },
);

module.exports = Prescricao;
