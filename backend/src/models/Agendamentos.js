const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Agendamentos = sequelize.define("Agendamentos", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  patient: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.STRING, allowNull: true },
  medico: { type: DataTypes.STRING, allowNull: true },
  cpf: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Agendamentos;

