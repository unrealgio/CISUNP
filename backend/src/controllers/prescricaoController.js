const Prescricao = require("../models/Prescricao");

// LISTA AS PRESCRIÇÕES DE UM PACIENTE PELO CPF
exports.listarPorCpf = async (req, res) => {
  try {
    const lista = await Prescricao.findAll({
      where: { pacienteId: req.paciente.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(lista);
  } catch (err) {
    console.error("Erro ao listar prescrições:", err);
    res.status(500).json({ error: "Erro ao listar prescrições." });
  }
};

// ADICIONA UMA NOVA PRESCRIÇÃO
exports.adicionar = async (req, res) => {
  try {
    const { medicamento, dose, frequencia, observacao } = req.body;
    const prescricao = await Prescricao.create({
      pacienteId: req.paciente.id,
      medicamento,
      dose,
      frequencia,
      observacao,
    });
    res.status(201).json(prescricao);
  } catch (err) {
    console.error("Erro ao adicionar prescrição:", err);
    res.status(500).json({ error: "Erro ao adicionar prescrição." });
  }
};
