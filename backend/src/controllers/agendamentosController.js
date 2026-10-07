const Agendamentos = require("../models/Agendamentos");
const Paciente = require("../models/Paciente");
const sequelize = require("../../config/database");
const { Op } = require("sequelize");

// LISTA OS AGENDAMENTOS POR DATA
exports.buscarPorData = async (req, res) => {
  const { date } = req.query;
  try {
    const agendamentos = await Agendamentos.findAll({
      where: { date },
      order: [["time", "ASC"]],
    });
    res.json(agendamentos);
  } catch (err) {
    console.error("Erro ao listar agendamentos:", err);
    res.status(500).json({ error: "Erro ao listar agendamentos." });
  }
};

// LISTA OS DIAS DE UM INTERVALO QUE POSSUEM AGENDAMENTOS (USADO NO CALENDÁRIO)
exports.diasComAgendamento = async (req, res) => {
  const { inicio, fim } = req.query;
  try {
    const dias = await Agendamentos.findAll({
      attributes: ["date"],
      where: { date: { [Op.between]: [inicio, fim] } },
      group: ["date"],
      raw: true,
    });
    res.json(dias.map((dia) => dia.date));
  } catch (err) {
    console.error("Erro ao listar dias com agendamentos:", err);
    res.status(500).json({ error: "Erro ao listar dias com agendamentos." });
  }
};

// DATA FORMATADA
function hojeLocal() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

// SINCRONIZA PACIENTE PELO CPF
async function sincronizarPaciente(
  { cpf, patient, phone, medico },
  transaction,
) {
  if (!cpf) return;
  const [paciente, created] = await Paciente.findOrCreate({
    where: { cpf },
    defaults: { patient, cpf, phone, medico },
    transaction,
  });
  if (created) return;

  // PREENCHE OS CAMPOS VAZIOS
  const camposVazios = {};
  if (!paciente.phone && phone) camposVazios.phone = phone;
  if (!paciente.medico && medico) camposVazios.medico = medico;
  if (Object.keys(camposVazios).length) {
    await paciente.update(camposVazios, { transaction });
  }
}

// DESFAZ A TRANSAÇÃO E RESPONDE COM O ERRO ADEQUADO
async function responderErroAoSalvar(res, transaction, err) {
  if (transaction && !transaction.finished) await transaction.rollback();
  if (err.name === "SequelizeUniqueConstraintError") {
    return res
      .status(409)
      .json({ error: "Já existe um agendamento neste horário." });
  }
  console.error("Erro ao salvar agendamento:", err);
  res.status(500).json({ error: "Erro ao salvar agendamento." });
}

// CRIA UM AGENDAMENTO
exports.criar = async (req, res) => {
  const { time, date, patient, cpf, phone, notes, medico } = req.body;
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const ocupado = await Agendamentos.findOne({
      where: { date, time },
      transaction,
    });
    if (ocupado) {
      await transaction.rollback();
      return res
        .status(409)
        .json({ error: "Já existe um agendamento neste horário." });
    }

    await sincronizarPaciente(req.body, transaction);
    const agendamento = await Agendamentos.create(
      { time, date, patient, cpf, phone, notes, medico },
      { transaction },
    );
    await transaction.commit();
    res.status(201).json(agendamento);
  } catch (err) {
    await responderErroAoSalvar(res, transaction, err);
  }
};

// ATUALIZA UM AGENDAMENTO
exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const { time, date, patient, cpf, phone, notes, medico } = req.body;
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const agendamento = await Agendamentos.findByPk(id, { transaction });
    if (!agendamento) {
      await transaction.rollback();
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }

    await sincronizarPaciente(req.body, transaction);
    await agendamento.update(
      { time, date, patient, cpf, phone, notes, medico },
      { transaction },
    );
    await transaction.commit();
    res.json(agendamento);
  } catch (err) {
    await responderErroAoSalvar(res, transaction, err);
  }
};

// EXCLUI UM AGENDAMENTO
exports.excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Agendamentos.destroy({ where: { id } });
    if (!deleted)
      return res.status(404).json({ error: "Agendamento não encontrado." });
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir agendamento:", err);
    res.status(500).json({ error: "Erro ao excluir agendamento." });
  }
};

// LISTA OS AGENDAMENTOS FUTUROS
exports.futurosPorPaciente = async (req, res) => {
  const { cpf } = req.query;
  const hoje = hojeLocal();
  try {
    const agendamentos = await Agendamentos.findAll({
      where: {
        cpf,
        date: { [Op.gte]: hoje },
      },
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
    });
    res.json(agendamentos);
  } catch (err) {
    console.error("Erro ao buscar agendamentos futuros:", err);
    res.status(500).json({ error: "Erro ao buscar agendamentos futuros." });
  }
};
