const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Paciente = sequelize.define("Paciente", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  patient: { type: DataTypes.STRING, allowNull: false },
  cpf: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  medico: { type: DataTypes.STRING, allowNull: true },
  idade: { type: DataTypes.INTEGER, allowNull: true },
  endereco: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: "pacientes",
  timestamps: false,
});

module.exports = Paciente;