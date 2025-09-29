const Agendamentos = require("../models/Agendamentos");

// Lista agendamentos por data
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

// Adiciona ou atualiza agendamento
exports.criarOuAtualizar = async (req, res) => {
  const { time, date, patient, cpf, phone, notes, medico } = req.body;
  try {
    // Se já existe, atualiza; senão, cria
    const [agendamento, created] = await Agendamentos.findOrCreate({
      where: { time, date },
      defaults: { patient, cpf, phone, notes, medico },
    });
    if (!created) {
      await agendamento.update({ patient, cpf, phone, notes, medico });
    }
    res.json(agendamento);
  } catch (err) {
    console.error("Erro ao salvar agendamento:", err);
    res.status(500).json({ error: "Erro ao salvar agendamento." });
  }
};

// Exclui agendamento por time e date
exports.excluir = async (req, res) => {
  const { time, date } = req.body;
  try {
    await Agendamentos.destroy({ where: { time, date } });
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir agendamento:", err);
    res.status(500).json({ error: "Erro ao excluir agendamento." });
  }
};