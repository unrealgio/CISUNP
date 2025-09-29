const Agendamentos = require("../models/Agendamentos");
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
    res.status(500).json({ error: "Erro ao listar agendamentos." });
  }
};

// CRIA OU ATUALIZA UM AGENDAMENTO
exports.criarOuAtualizar = async (req, res) => {
  const { time, date, patient, cpf, phone, notes, medico } = req.body;
  if (!time || !date || !patient) {
    return res.status(400).json({ error: "Horário, data e nome do paciente são obrigatórios." });
  }
  try {
    const [agendamento, created] = await Agendamentos.findOrCreate({
      where: { time, date },
      defaults: { patient, cpf, phone, notes, medico }
    });
    if (!created) {
      await agendamento.update({ patient, cpf, phone, notes, medico });
    }
    res.json(agendamento);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar agendamento." });
  }
};

// EXCLUI UM AGENDAMENTO BASEADO NO HORÁRIO MARCADO
exports.excluir = async (req, res) => {
  const { time, date } = req.body;
  try {
    const deleted = await Agendamentos.destroy({ where: { time, date } });
    res.json({ success: deleted > 0 });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir agendamento." });
  }
};

// LISTA OS AGENDAMENTOS FUTUROS DE UM PACIENTE PELO CPF
exports.futurosPorPaciente = async (req, res) => {
  const { cpf } = req.query;
  const hoje = new Date().toISOString().slice(0, 10);
  try {
    const agendamentos = await Agendamentos.findAll({
      where: {
        cpf,
        date: { [Op.gte]: hoje }
      },
      order: [["date", "ASC"], ["time", "ASC"]]
    });
    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar agendamentos futuros." });
  }
};