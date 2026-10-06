const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Agendamentos = sequelize.define(
  "Agendamentos",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    time: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    patient: { type: DataTypes.STRING, allowNull: false },
    cpf: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.STRING, allowNull: true },
    medico: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "agendamentos",
    timestamps: false,
    indexes: [{ unique: true, fields: ["date", "time"] }],
  },
);

module.exports = Agendamentos;
