const { DataTypes, Op } = require("sequelize");
const sequelize = require("../../config/database");
const Paciente = require("./Paciente");
const { STATUS_AGENDAMENTO } = require("../utils/statusAgendamento");

const Agendamentos = sequelize.define(
  "Agendamentos",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    time: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    pacienteId: { type: DataTypes.INTEGER, allowNull: true },
    patient: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.STRING, allowNull: true },
    medico: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pendente",
      validate: { isIn: [STATUS_AGENDAMENTO] },
    },
  },
  {
    tableName: "agendamentos",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["date", "time"],
        name: "agendamentos_horario_ativo",
        where: { status: { [Op.ne]: "cancelada" } },
      },
    ],
  },
);

Agendamentos.belongsTo(Paciente, { as: "paciente", foreignKey: "pacienteId" });

module.exports = Agendamentos;
