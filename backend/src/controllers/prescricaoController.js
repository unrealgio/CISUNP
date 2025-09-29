const Prescricao = require("../models/Prescricao");

exports.listarPorCpf = async (req, res) => {
  try {
    const { cpf } = req.query;
    const lista = await Prescricao.findAll({ where: { cpf } });
    res.json(lista);
  } catch (err) {
    console.error("Erro ao listar prescrições:", err);
    res.status(500).json({ error: "Erro ao listar prescrições." });
  }
};

exports.adicionar = async (req, res) => {
  try {
    const { cpf, medicamento, dose, frequencia, observacao } = req.body;
    const prescricao = await Prescricao.create({ cpf, medicamento, dose, frequencia, observacao });
    res.json(prescricao);
  } catch (err) {
    console.error("Erro ao adicionar prescrição:", err);
    res.status(500).json({ error: "Erro ao adicionar prescrição." });
  }
};