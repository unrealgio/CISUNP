const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { STATUS_PROCEDIMENTO } = require("../utils/statusProcedimento");

const Procedimento = sequelize.define(
  "Procedimento",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pacienteId: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { type: DataTypes.STRING, allowNull: false },
    dente: DataTypes.STRING,
    data: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "planejado",
      validate: { isIn: [STATUS_PROCEDIMENTO] },
    },
    observacao: DataTypes.STRING,
  },
  {
    tableName: "procedimentos",
    timestamps: true,
  },
);

module.exports = Procedimento;
